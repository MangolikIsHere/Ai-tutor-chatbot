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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

# =========================
# Gemini Setup
# =========================
@lru_cache(maxsize=1)
def get_gemini_client():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise RuntimeError("GOOGLE_API_KEY not set")

    from google import genai
    return genai.Client(api_key=api_key)


def ask_gemini(prompt: str) -> str:
    client = get_gemini_client()
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt
    )
    return response.text or "No response"


# =========================
# RAG Setup (HuggingFace SAFE)
# =========================
logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_embeddings():
    from langchain_huggingface import HuggingFaceEmbeddings

    return HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )


@lru_cache(maxsize=1)
def get_vector_store():
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
            chunk_overlap=200
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
    get_vector_store()


@app.post("/chat")
def chat(request: ChatRequest):
    try:
        db = get_vector_store()

        context = "No context available"
        if db:
            docs = db.as_retriever().invoke(request.message)
            context = " ".join(doc.page_content for doc in docs)

        prompt = build_prompt(context, request.message)
        answer = ask_gemini(prompt)

        return {"response": answer}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "10000"))
    uvicorn.run("rag_chatbot:app", host="0.0.0.0", port=port)