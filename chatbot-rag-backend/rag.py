import logging
import threading
from functools import lru_cache

from config import (
    ENABLE_RAG,
    EMBEDDING_BACKEND,
    EMBEDDING_MODEL,
    PDF_PATH,
    FAISS_INDEX_DIR,
    RAG_TOP_K,
    RAG_CONTEXT_MAX_CHARS,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)
from prompts import ML_KEYWORDS

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Module-level state
# ---------------------------------------------------------------------------
_retriever = None
_init_lock = threading.Lock()
_init_done = False


# ---------------------------------------------------------------------------
# Query gate
# ---------------------------------------------------------------------------
def is_ml_query(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in ML_KEYWORDS)


# ---------------------------------------------------------------------------
# Embedding factory  (lazy, cached)
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def _get_embeddings():
    if EMBEDDING_BACKEND == "fastembed":
        # ~50 MB ONNX model, no PyTorch required
        try:
            from langchain_community.embeddings import FastEmbedEmbeddings

            logger.info("Loading FastEmbed embeddings (model=%s)", EMBEDDING_MODEL)
            return FastEmbedEmbeddings(model_name=EMBEDDING_MODEL)
        except ImportError:
            logger.warning(
                "fastembed not available, falling back to HuggingFaceEmbeddings"
            )

    # HuggingFace / sentence-transformers fallback
    try:
        from langchain_huggingface import HuggingFaceEmbeddings
    except ImportError:
        from langchain_community.embeddings import HuggingFaceEmbeddings  # type: ignore

    logger.info("Loading HuggingFace embeddings (model=%s)", EMBEDDING_MODEL)
    return HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)


# ---------------------------------------------------------------------------
# Vector-store factory  (lazy, cached)
# ---------------------------------------------------------------------------
@lru_cache(maxsize=1)
def _get_vector_store():
    if not ENABLE_RAG:
        return None

    try:
        from langchain_community.vectorstores import FAISS

        embeddings = _get_embeddings()

        # ── Load pre-built index from disk (fast path) ──────────────────────
        if FAISS_INDEX_DIR.exists() and any(FAISS_INDEX_DIR.iterdir()):
            logger.info("Loading FAISS index from %s", FAISS_INDEX_DIR)
            return FAISS.load_local(
                str(FAISS_INDEX_DIR),
                embeddings,
                allow_dangerous_deserialization=True,
            )

        # ── Build index from PDF (slow path, first run only) ────────────────
        if not PDF_PATH.exists():
            logger.warning("PDF not found at %s and no FAISS index on disk", PDF_PATH)
            return None

        logger.info("Building FAISS index from %s …", PDF_PATH)

        from langchain_community.document_loaders import PyPDFLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        docs = PyPDFLoader(str(PDF_PATH)).load()
        chunks = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        ).split_documents(docs)

        db = FAISS.from_documents(chunks, embeddings)
        FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)
        db.save_local(str(FAISS_INDEX_DIR))
        logger.info("FAISS index saved to %s", FAISS_INDEX_DIR)
        return db

    except Exception:
        logger.exception("Failed to initialise vector store")
        return None


# ---------------------------------------------------------------------------
# Public warm-up helper  (called optionally at startup or on first request)
# ---------------------------------------------------------------------------
def warm_rag() -> None:
    global _retriever, _init_done

    with _init_lock:
        if _init_done:
            return
        _init_done = True

    try:
        db = _get_vector_store()
        if db is not None:
            _retriever = db.as_retriever(search_kwargs={"k": RAG_TOP_K})
            logger.info("RAG retriever ready")
        else:
            logger.warning("RAG retriever not available (no index or PDF)")
    except Exception:
        logger.exception("warm_rag failed")


# ---------------------------------------------------------------------------
# Public retrieval entry-point
# ---------------------------------------------------------------------------
def retrieve_context(query: str) -> str | None:
    if not ENABLE_RAG:
        return None

    if not is_ml_query(query):
        return None

    # Lazy init on first real request if prewarm was skipped
    if _retriever is None:
        warm_rag()

    if _retriever is None:
        return None

    try:
        docs = _retriever.invoke(query)
        text = " ".join(d.page_content for d in docs)
        return text[:RAG_CONTEXT_MAX_CHARS] or None
    except Exception:
        logger.warning("Retrieval failed", exc_info=True)
        return None
