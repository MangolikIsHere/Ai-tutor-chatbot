from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from functools import lru_cache
from dotenv import load_dotenv
from pathlib import Path
import os

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
# RAG Setup
# =========================
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings


@lru_cache(maxsize=1)
def get_vector_store():
    pdf_path = BASE_DIR / "ml-book.pdf"

    if not pdf_path.exists():
        print("⚠️ PDF not found, skipping RAG")
        return None

    try:
        loader = PyPDFLoader(str(pdf_path))
        documents = loader.load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        docs = splitter.split_documents(documents)

        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        return FAISS.from_documents(docs, embeddings)

    except Exception as e:
        print("RAG ERROR:", e)
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