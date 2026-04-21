import threading
import logging
import asyncio
import re
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import ENABLE_RAG, PORT, LLM_REQUEST_TIMEOUT_SECONDS, RAG_PREWARM_ON_STARTUP
from rag import warm_rag, retrieve_context

from llm import ask_llm

from prompts import build_rag_prompt, build_plain_prompt

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if ENABLE_RAG and RAG_PREWARM_ON_STARTUP:
        threading.Thread(
            target=warm_rag,
            daemon=True
        ).start()
    elif ENABLE_RAG:
        logger.info("Skipping RAG prewarm on startup")

    yield


app = FastAPI(title="ML RAG Chatbot", lifespan=lifespan)
application = app


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str | None = None


class ChatResponse(BaseModel):
    response: str
    rag_used: bool


@app.get("/")
async def home():
    return {"message": "API running 🚀"}


@app.get("/healthz")
async def healthz():
    return {"status": "ok"}


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        # -------------------------
        # Retrieve context from RAG
        # -------------------------
        context = retrieve_context(request.message)

        if context:
            prompt = build_rag_prompt(
                context,
                request.message
            )
        else:
            prompt = build_plain_prompt(
                request.message
            )

        # -------------------------
        # Ask LLM
        # # Groq only provider
        # -------------------------
        try:
            answer = await asyncio.wait_for(
                asyncio.to_thread(ask_llm, prompt),
                timeout=LLM_REQUEST_TIMEOUT_SECONDS,
            )

        except RuntimeError as llm_error:
            logger.warning("LLM unavailable: %s", llm_error)

            error_text = str(llm_error)
            lower_error_text = error_text.lower()

            if "quota" in lower_error_text or "429" in lower_error_text or "rate limit" in lower_error_text:
                retry_match = re.search(r"retry(?:\s+in)?\s+(\d+(?:\.\d+)?)s", error_text, re.IGNORECASE)
                retry_after_seconds = "30"

                if retry_match:
                    retry_after_seconds = str(max(1, int(float(retry_match.group(1)))))

                raise HTTPException(
                    status_code=429,
                    detail=(
                        "LLM quota/rate limit exceeded. "
                        f"Please retry after about {retry_after_seconds} seconds."
                    ),
                    headers={"Retry-After": retry_after_seconds}
                )

            raise HTTPException(
                status_code=503,
                detail=str(llm_error)
            )

        except TimeoutError:
            logger.warning(
                "LLM call timed out after %ss",
                LLM_REQUEST_TIMEOUT_SECONDS,
            )

            raise HTTPException(
                status_code=504,
                detail="Model response timed out. Please try again."
            )

        return ChatResponse(
            response=answer,
            rag_used=bool(context)
        )

    except HTTPException:
        raise

    except Exception as e:
        logger.exception("Chat failed: %s", e)

        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        reload=False
    )