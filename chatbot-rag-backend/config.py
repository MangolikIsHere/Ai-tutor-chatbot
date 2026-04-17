import os
import logging
from pathlib import Path
from dotenv import load_dotenv

# ---------------------------------------------------
# Paths
# ---------------------------------------------------
BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"
PDF_PATH = BASE_DIR / "ml-book.pdf"
FAISS_INDEX_DIR = BASE_DIR / "faiss_index"

load_dotenv(ENV_PATH)

# ---------------------------------------------------
# Logging
# ---------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)

logger = logging.getLogger(__name__)

# ---------------------------------------------------
# Helpers
# ---------------------------------------------------
def env_flag(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}

# ---------------------------------------------------
# Settings
# ---------------------------------------------------
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "")

ENABLE_RAG = env_flag(
    "ENABLE_RAG",
    default=os.getenv("RENDER") is None
)

PORT = int(os.getenv("PORT", "10000"))

# Gemini
GEMINI_MODEL = "gemini-2.5-flash"
GEMINI_MAX_OUTPUT_TOKENS = int(os.getenv("GEMINI_MAX_OUTPUT_TOKENS", "1024"))
LLM_REQUEST_TIMEOUT_SECONDS = int(os.getenv("LLM_REQUEST_TIMEOUT_SECONDS", "30"))

# RAG
RAG_TOP_K = 2
RAG_CONTEXT_MAX_CHARS = 1200
CHUNK_SIZE = 900
CHUNK_OVERLAP = 100
EMBEDDING_MODEL = "sentence-transformers/all-MiniLM-L6-v2"