import os
import logging
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
PDF_PATH = BASE_DIR / "ml-book.pdf"
FAISS_INDEX_DIR = BASE_DIR / "faiss_index"

if ENV_PATH.exists():
    load_dotenv(ENV_PATH)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)

logger = logging.getLogger(__name__)


def env_flag(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

ENABLE_RAG = env_flag("ENABLE_RAG", True)

# Disabled by default — prewarm adds cold-start latency on Render free tier
RAG_PREWARM_ON_STARTUP = env_flag("RAG_PREWARM_ON_STARTUP", False)

PORT = int(os.getenv("PORT", "10000"))
LLM_REQUEST_TIMEOUT_SECONDS = int(os.getenv("LLM_REQUEST_TIMEOUT_SECONDS", "45"))

# ---------------------------------------------------------------------------
# Embedding backend
# "fastembed"  → ONNX runtime, no PyTorch, fastest cold-start  (default)
# "huggingface" → original sentence-transformers path
# ---------------------------------------------------------------------------
EMBEDDING_BACKEND = os.getenv("EMBEDDING_BACKEND", "fastembed").strip().lower()
EMBEDDING_MODEL = os.getenv(
    "EMBEDDING_MODEL",
    # fastembed model id            huggingface model id
    "BAAI/bge-small-en-v1.5"       # same name works for both backends
).strip()

RAG_TOP_K = 2
RAG_CONTEXT_MAX_CHARS = 1200
CHUNK_SIZE = 900
CHUNK_OVERLAP = 100
