"""
rag_chatbot.py — FastAPI app for ChatPDF + plain Groq chat with buffer memory.

Endpoints:
  GET  /           health ping
  GET  /healthz    liveness probe (Render)
  POST /upload     ingest a user PDF → returns session_id
  POST /chat       multi-turn chat; uses PDF context + conversation history
                   when session_id is provided
"""

from __future__ import annotations

import asyncio
import logging
import re
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import (
    LLM_REQUEST_TIMEOUT_SECONDS,
    MAX_UPLOAD_BYTES,
    PORT,
    RAG_RETRIEVAL_TIMEOUT_SECONDS,
)
from llm import ask_llm
from prompts import system_prompt_plain, system_prompt_with_context
from rag import add_turn, build_session_index, get_history, retrieve_context

logger = logging.getLogger(__name__)


# ── Lifespan ──────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(_app: FastAPI):
    logger.info("ChatPDF API starting (lazy mode — no startup work)")
    yield
    logger.info("ChatPDF API shutting down")


# ── App ───────────────────────────────────────────────────────────────────────

app = FastAPI(title="ChatPDF API", lifespan=lifespan)
application = app  # gunicorn/uvicorn alias

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Schemas ───────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message:    str        = Field(..., min_length=1, max_length=2000)
    session_id: str | None = None


class ChatResponse(BaseModel):
    response:   str
    rag_used:   bool
    session_id: str        # always echo back so the frontend can store it


class UploadResponse(BaseModel):
    message:    str
    session_id: str
    chunks:     int


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
async def home():
    return {"message": "ChatPDF API running 🚀"}


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


# ── Upload ────────────────────────────────────────────────────────────────────

@app.post("/upload", response_model=UploadResponse)
async def upload_pdf(file: UploadFile = File(...)):
    """
    Accept a PDF → build FAISS index → return session_id.
    Pass this session_id in all subsequent /chat requests to get
    document-grounded, memory-aware answers.
    """
    filename = file.filename or ""
    if file.content_type not in ("application/pdf", "application/octet-stream"):
        if not filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=415, detail="Only PDF files are accepted.")

    pdf_bytes = await file.read()

    if not pdf_bytes:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    if len(pdf_bytes) > MAX_UPLOAD_BYTES:
        mb = MAX_UPLOAD_BYTES // (1024 * 1024)
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum allowed size is {mb} MB.",
        )

    session_id = str(uuid.uuid4())

    try:
        chunks = await asyncio.to_thread(build_session_index, pdf_bytes, session_id)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except RuntimeError as exc:
        logger.exception("Indexing failed for session %s", session_id)
        raise HTTPException(status_code=500, detail=str(exc))

    return UploadResponse(
        message="PDF indexed successfully.",
        session_id=session_id,
        chunks=chunks,
    )


# ── Chat ──────────────────────────────────────────────────────────────────────

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Multi-turn chat endpoint.

    With session_id:
      1. Retrieve relevant PDF context for the current query.
      2. Fetch the session's conversation history (buffer memory).
      3. Append the new user message to history.
      4. Call Groq with system prompt + full history.
      5. Save the assistant reply back to history.

    Without session_id:
      A fresh session_id is created automatically so the conversation
      is still remembered across turns — just without any PDF context.
    """
    # ── Resolve session ───────────────────────────────────────────────────
    # Create a new session_id if the client didn't supply one.
    session_id = request.session_id or str(uuid.uuid4())

    # ── Retrieve PDF context (only when session has a retriever) ──────────
    context: str | None = None
    try:
        context = await asyncio.wait_for(
            asyncio.to_thread(retrieve_context, request.message, session_id),
            timeout=RAG_RETRIEVAL_TIMEOUT_SECONDS,
        )
    except TimeoutError:
        logger.warning("RAG retrieval timed out — continuing without context")
    except Exception:
        logger.warning("RAG retrieval error — continuing without context", exc_info=True)

    # ── Build system prompt ───────────────────────────────────────────────
    system = (
        system_prompt_with_context(context)
        if context
        else system_prompt_plain()
    )

    # ── Fetch history + append current user message ───────────────────────
    history = await asyncio.to_thread(get_history, session_id)
    messages = [*history, {"role": "user", "content": request.message}]

    # ── Call LLM ──────────────────────────────────────────────────────────
    try:
        answer = await asyncio.wait_for(
            asyncio.to_thread(ask_llm, system, messages),
            timeout=LLM_REQUEST_TIMEOUT_SECONDS,
        )
    except RuntimeError as exc:
        _handle_llm_error(exc)
    except TimeoutError:
        logger.warning("LLM timed out after %ss", LLM_REQUEST_TIMEOUT_SECONDS)
        raise HTTPException(
            status_code=504,
            detail="The model took too long to respond. Please try again.",
        )

    # ── Persist this turn to buffer memory ────────────────────────────────
    await asyncio.to_thread(add_turn, session_id, request.message, answer)

    return ChatResponse(response=answer, rag_used=bool(context), session_id=session_id)


# ── Error helper ──────────────────────────────────────────────────────────────

def _handle_llm_error(exc: RuntimeError) -> None:
    msg   = str(exc)
    lower = msg.lower()

    if "quota" in lower or "429" in lower or "rate limit" in lower:
        m = re.search(r"retry(?:\s+in)?\s+(\d+(?:\.\d+)?)s", msg, re.IGNORECASE)
        retry_after = str(max(1, int(float(m.group(1))))) if m else "30"
        raise HTTPException(
            status_code=429,
            detail=f"Rate limit reached. Retry after ~{retry_after} seconds.",
            headers={"Retry-After": retry_after},
        )

    raise HTTPException(status_code=503, detail=msg)


# ── Dev entry-point ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)
