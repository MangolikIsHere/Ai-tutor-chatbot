"""
rag.py — session-scoped RAG + buffer memory for user-uploaded PDFs.

Each session stores:
  • retriever  — FAISS retriever built from the uploaded PDF (optional;
                 None for plain-chat sessions created by /chat without upload)
  • history    — rolling list of {"role": "user"|"assistant", "content": str}
                 capped at MEMORY_MAX_TURNS * 2 messages
  • expires_at — monotonic timestamp; session is dropped after TTL

Design goals:
  • Zero work on startup — embeddings not loaded until first upload.
  • Thread-safe: one lock guards the whole session dict.
  • No disk persistence — minimal footprint for free-tier hosting.
"""

from __future__ import annotations

import logging
import threading
import time
from collections import deque
from functools import lru_cache
from io import BytesIO
from typing import Optional

from langchain_core.embeddings import Embeddings

from config import (
    CHUNK_OVERLAP,
    CHUNK_SIZE,
    EMBEDDING_MODEL,
    FASTEMBED_CACHE_PATH,
    MEMORY_MAX_TURNS,
    RAG_CONTEXT_MAX_CHARS,
    RAG_TOP_K,
    SESSION_TTL_SECONDS,
)

logger = logging.getLogger(__name__)

# ── Types ─────────────────────────────────────────────────────────────────────
# A single chat turn message compatible with Groq's messages API.
# {"role": "user" | "assistant", "content": str}
HistoryMessage = dict[str, str]

# ── In-memory session store ───────────────────────────────────────────────────
# {
#   session_id: {
#     "retriever":  <FAISS retriever> | None,
#     "history":    deque[HistoryMessage],   # max length = MEMORY_MAX_TURNS * 2
#     "expires_at": float,
#   }
# }
_sessions: dict[str, dict] = {}
_store_lock = threading.Lock()

_MAX_HISTORY_MSGS = MEMORY_MAX_TURNS * 2  # each turn = 1 user + 1 assistant msg


# ── Lazy embedding singleton ──────────────────────────────────────────────────

class _FastEmbeddings(Embeddings):
    """LangChain-compatible embeddings backed by fastembed — loaded once."""

    def __init__(self) -> None:
        from fastembed import TextEmbedding  # lazy import
        logger.info("Loading FastEmbed model: %s", EMBEDDING_MODEL)
        self._model = TextEmbedding(
            model_name=EMBEDDING_MODEL,
            cache_dir=FASTEMBED_CACHE_PATH,
        )

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [v.tolist() for v in self._model.embed(texts)]

    def embed_query(self, text: str) -> list[float]:
        return list(self._model.query_embed([text]))[0].tolist()


@lru_cache(maxsize=1)
def _get_embeddings() -> _FastEmbeddings:
    """Singleton — instantiated on first upload, then reused forever."""
    return _FastEmbeddings()


# ── Internal helpers ──────────────────────────────────────────────────────────

def _prune_expired() -> None:
    """Drop expired sessions. Must be called while holding _store_lock."""
    now = time.monotonic()
    expired = [sid for sid, v in _sessions.items() if v["expires_at"] < now]
    for sid in expired:
        del _sessions[sid]
        logger.info("Session expired and pruned: %s", sid)


def _touch(session_id: str) -> None:
    """Reset TTL on an existing session. Must be called while holding _store_lock."""
    if session_id in _sessions:
        _sessions[session_id]["expires_at"] = time.monotonic() + SESSION_TTL_SECONDS


def _get_entry(session_id: str) -> dict | None:
    """
    Return the session entry if it exists and has not expired, else None.
    Deletes the entry on expiry. Must be called while holding _store_lock.
    """
    entry = _sessions.get(session_id)
    if entry is None:
        return None
    if entry["expires_at"] < time.monotonic():
        del _sessions[session_id]
        logger.info("Session TTL expired on access: %s", session_id)
        return None
    return entry


def _ensure_session(session_id: str) -> dict:
    """
    Return the session entry, creating a plain-chat (no-retriever) session
    if it doesn't exist yet. Must be called while holding _store_lock.
    """
    entry = _get_entry(session_id)
    if entry is None:
        entry = {
            "retriever":  None,
            "history":    deque(maxlen=_MAX_HISTORY_MSGS),
            "expires_at": time.monotonic() + SESSION_TTL_SECONDS,
        }
        _sessions[session_id] = entry
        logger.info("Plain-chat session created: %s", session_id)
    return entry


# ── Public API ────────────────────────────────────────────────────────────────

def build_session_index(pdf_bytes: bytes, session_id: str) -> int:
    """
    Parse *pdf_bytes*, build a FAISS index, and store the retriever in the
    session. Preserves any existing conversation history for this session_id
    (relevant if the user re-uploads mid-conversation).

    Returns the number of chunks indexed.
    Raises ValueError for empty / unreadable PDFs.
    Raises RuntimeError for indexing failures.
    """
    from langchain_community.vectorstores import FAISS
    from langchain_text_splitters import RecursiveCharacterTextSplitter

    # 1. Extract text ──────────────────────────────────────────────────────
    try:
        import pypdf
        reader = pypdf.PdfReader(BytesIO(pdf_bytes))
        pages_text = [page.extract_text() or "" for page in reader.pages]
        full_text = "\n".join(pages_text).strip()
    except Exception as exc:
        raise ValueError(f"Could not read PDF: {exc}") from exc

    if not full_text:
        raise ValueError("PDF contains no extractable text.")

    # 2. Chunk ─────────────────────────────────────────────────────────────
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    chunks = splitter.create_documents([full_text])
    if not chunks:
        raise ValueError("PDF produced no text chunks after splitting.")

    logger.info("PDF split into %d chunks for session %s", len(chunks), session_id)

    # 3. Embed + index ─────────────────────────────────────────────────────
    try:
        db = FAISS.from_documents(chunks, _get_embeddings())
    except Exception as exc:
        raise RuntimeError(f"Failed to build vector index: {exc}") from exc

    retriever = db.as_retriever(search_kwargs={"k": RAG_TOP_K})

    # 4. Store — preserve existing history if any ──────────────────────────
    with _store_lock:
        _prune_expired()
        existing = _sessions.get(session_id)
        history  = existing["history"] if existing else deque(maxlen=_MAX_HISTORY_MSGS)
        _sessions[session_id] = {
            "retriever":  retriever,
            "history":    history,
            "expires_at": time.monotonic() + SESSION_TTL_SECONDS,
        }

    logger.info(
        "Session %s indexed (%d chunks, TTL %ds, history=%d msgs)",
        session_id, len(chunks), SESSION_TTL_SECONDS, len(history),
    )
    return len(chunks)


def retrieve_context(query: str, session_id: str) -> Optional[str]:
    """
    Retrieve document context for *query* from the session's FAISS index.
    Returns None if the session has no retriever or if retrieval fails.
    """
    with _store_lock:
        entry = _get_entry(session_id)
        retriever = entry["retriever"] if entry else None

    if retriever is None:
        return None

    try:
        docs = retriever.invoke(query)
        text = " ".join(d.page_content for d in docs).strip()
        return text[:RAG_CONTEXT_MAX_CHARS] or None
    except Exception:
        logger.warning("Retrieval failed for session %s", session_id, exc_info=True)
        return None


def get_history(session_id: str) -> list[HistoryMessage]:
    """
    Return a plain list of past messages for this session (oldest first),
    suitable for passing directly to the Groq messages API.

    Creates a plain-chat session automatically if none exists,
    so /chat works without a prior /upload.
    """
    with _store_lock:
        entry = _ensure_session(session_id)
        _touch(session_id)
        return list(entry["history"])


def add_turn(session_id: str, user_message: str, assistant_message: str) -> None:
    """
    Append a completed user/assistant turn to the session history.
    The deque automatically evicts the oldest messages beyond the cap.
    """
    with _store_lock:
        entry = _ensure_session(session_id)
        entry["history"].append({"role": "user",      "content": user_message})
        entry["history"].append({"role": "assistant", "content": assistant_message})
        _touch(session_id)
