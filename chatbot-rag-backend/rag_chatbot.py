import threading
import logging
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from config import ENABLE_RAG, PORT, LLM_REQUEST_TIMEOUT_SECONDS
from rag import warm_rag, retrieve_context
from llm import ask_gemini
from prompts import build_rag_prompt, build_plain_prompt

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_app: FastAPI):
    if ENABLE_RAG:
        threading.Thread(
            target=warm_rag,
            daemon=True
        ).start()

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

        try:
            answer = await asyncio.wait_for(
                asyncio.to_thread(ask_gemini, prompt),
                timeout=LLM_REQUEST_TIMEOUT_SECONDS,
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