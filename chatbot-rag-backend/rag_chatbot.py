from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from functools import lru_cache
from dotenv import load_dotenv
from pathlib import Path
import os
import logging

# =========================
# App Setup
# =========================
app = FastAPI()
# Some hosts/loaders look for an `application` ASGI callable.
application = app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")


def _env_flag(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


# Disable local embedding-heavy RAG by default on Render to avoid OOM/timeouts.
ENABLE_RAG = _env_flag("ENABLE_RAG", default=os.getenv("RENDER") is None)

# =========================
# Gemini Setup
# =========================
@lru_cache(maxsize=1)
def get_gemini_client():
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY not set")

    # Prefer the new SDK when available, but support google-generativeai too.
    try:
        from google import genai

        return {
            "sdk": "google-genai",
            "client": genai.Client(api_key=api_key),
        }
    except Exception:
        import google.generativeai as genai

        genai.configure(api_key=api_key)
        return {
            "sdk": "google-generativeai",
            "client": genai.GenerativeModel("gemini-2.5-flash"),
        }


def ask_gemini(prompt: str) -> str:
    gemini = get_gemini_client()

    if gemini["sdk"] == "google-genai":
        response = gemini["client"].models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )
        return response.text or "No response"

    response = gemini["client"].generate_content(prompt)
    text = getattr(response, "text", None)
    return text or "No response"


# =========================
# RAG Setup (HuggingFace SAFE)
# =========================
logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_embeddings():
    if not ENABLE_RAG:
        raise RuntimeError("RAG disabled via ENABLE_RAG")

    from langchain_huggingface import HuggingFaceEmbeddings

    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


@lru_cache(maxsize=1)
def get_vector_store():
    if not ENABLE_RAG:
        logger.info("RAG disabled; skipping vector store initialization")
        return None

    try:
        # Import RAG dependencies lazily so the web server can boot quickly on Render.
        from langchain_community.document_loaders import PyPDFLoader
        from langchain_community.vectorstores import FAISS
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        index_dir = BASE_DIR / "faiss_index"
        if index_dir.exists():
            logger.info("Loading FAISS index from %s", index_dir)
            return FAISS.load_local(
                str(index_dir),
                get_embeddings(),
                allow_dangerous_deserialization=True,
            )

        pdf_path = BASE_DIR / "ml-book.pdf"

        if not pdf_path.exists():
            logger.warning("PDF not found at %s", pdf_path)
            return None

        loader = PyPDFLoader(str(pdf_path))
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
        docs = splitter.split_documents(documents)

        logger.info("Creating FAISS index...")
        return FAISS.from_documents(docs, get_embeddings())

    except Exception as e:
        logger.exception("RAG initialization failed: %s", e)
        return None


# =========================
# Models
# =========================
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    session_id: str


# =========================
# Helper
# =========================
def build_prompt(context: str, query: str) -> str:
    return f"""
You are an ML tutor.

Context:
{context}

Question:
{query}
"""


# =========================
# Routes
# =========================
@app.get("/")
def home():
    return {"message": "API running 🚀"}


@app.get("/healthz")
def healthz():
    return {"status": "ok"}


@app.on_event("startup")
def warm_rag_cache():
    """Warm RAG cache on startup, but don't block if index doesn't exist."""
    if not ENABLE_RAG:
        logger.info("RAG warmup skipped because ENABLE_RAG is false")
        return

    import threading
    def _warm():
        try:
            get_vector_store()
            logger.info("RAG cache warmed successfully")
        except Exception as e:
            logger.warning("RAG cache warming failed (non-blocking): %s", e)
    
    # Run in background thread so it doesn't block startup
    thread = threading.Thread(target=_warm, daemon=True)
    thread.start()


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        context = "No context available"
        try:
            db = get_vector_store()
            if db:
                # Limit to top 3 docs and truncate context to 1500 chars
                docs = db.as_retriever(search_kwargs={"k": 3}).invoke(request.message)
                raw_context = " ".join(doc.page_content for doc in docs)
                context = raw_context[:1500]
        except Exception as e:
            logger.warning("RAG retrieval failed (continuing without context): %s", e)
            pass

        prompt = build_prompt(context, request.message)
        answer = ask_gemini(prompt)

        return {"response": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "10000"))
    # Pass the app object directly to avoid module import path issues.
    uvicorn.run(app, host="0.0.0.0", port=port)