import asyncio
import logging
import re
import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import (
    ENABLE_RAG,
    LLM_REQUEST_TIMEOUT_SECONDS,
    PORT,
    RAG_PREWARM_ON_STARTUP,
    RAG_RETRIEVAL_TIMEOUT_SECONDS,
)
from llm import ask_llm
from prompts import build_plain_prompt, build_rag_prompt
from rag import retrieve_context, warm_rag

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Lifespan
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(_app: FastAPI):
    if ENABLE_RAG and RAG_PREWARM_ON_STARTUP:
        # Run in a daemon thread so it never blocks the ASGI server from
        # accepting requests — Render's health-check must pass quickly.
        threading.Thread(target=warm_rag, daemon=True, name="rag-prewarm").start()
        logger.info("RAG prewarm started in background thread")
    else:
        logger.info("RAG prewarm skipped (RAG_PREWARM_ON_STARTUP=false)")
    yield


# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------
app = FastAPI(title="ML RAG Chatbot", lifespan=lifespan)
application = app  # Gunicorn / uvicorn entry-point alias

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Schema
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    rag_used: bool


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def home():
    return {"message": "API running 🚀"}


@app.get("/healthz")
async def healthz():
    """Lightweight liveness probe — Render calls this every 30 s."""
    return {"status": "ok"}


@app.get("/readyz")
async def readyz():
    """
    Readiness probe — returns 503 until the RAG retriever is warmed up.
    Useful if you want Render to hold traffic until the index is loaded.
    """
    from rag import _retriever  # noqa: PLC0415

    if ENABLE_RAG and RAG_PREWARM_ON_STARTUP and _retriever is None:
        raise HTTPException(status_code=503, detail="RAG not ready yet")
    return {"status": "ready"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        context = None

        if ENABLE_RAG:
            try:
                # Time-bound retrieval so first-time model/index load does not
                # hold the HTTP request long enough to trigger a 502 upstream.
                context = await asyncio.wait_for(
                    asyncio.to_thread(retrieve_context, request.message),
                    timeout=RAG_RETRIEVAL_TIMEOUT_SECONDS,
                )
            except TimeoutError:
                logger.warning(
                    "RAG retrieval timed out after %ss; continuing without context",
                    RAG_RETRIEVAL_TIMEOUT_SECONDS,
                )
                context = None
            except Exception:
                logger.warning("RAG retrieval failed; continuing without context", exc_info=True)
                context = None

        prompt = (
            build_rag_prompt(context, request.message)
            if context
            else build_plain_prompt(request.message)
        )

        try:
            answer = await asyncio.wait_for(
                asyncio.to_thread(ask_llm, prompt),
                timeout=LLM_REQUEST_TIMEOUT_SECONDS,
            )

        except RuntimeError as exc:
            _handle_llm_runtime_error(exc)

        except TimeoutError:
            logger.warning("LLM timed out after %ss", LLM_REQUEST_TIMEOUT_SECONDS)
            raise HTTPException(
                status_code=504,
                detail="Model response timed out. Please try again.",
            )

        return ChatResponse(response=answer, rag_used=bool(context))

    except HTTPException:
        raise
    except Exception:
        logger.exception("Unhandled error in /chat")
        raise HTTPException(status_code=500, detail="Internal server error")


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def _handle_llm_runtime_error(exc: RuntimeError) -> None:
    """Raise the appropriate HTTPException for known LLM errors."""
    msg = str(exc)
    lower = msg.lower()

    if "quota" in lower or "429" in lower or "rate limit" in lower:
        m = re.search(r"retry(?:\s+in)?\s+(\d+(?:\.\d+)?)s", msg, re.IGNORECASE)
        retry_after = str(max(1, int(float(m.group(1))))) if m else "30"
        raise HTTPException(
            status_code=429,
            detail=(
                f"LLM rate limit hit. Please retry after ~{retry_after} seconds."
            ),
            headers={"Retry-After": retry_after},
        )

    raise HTTPException(status_code=503, detail=msg)


# ---------------------------------------------------------------------------
# Dev entry-point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=PORT, reload=False)
