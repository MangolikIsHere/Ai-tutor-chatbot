import os
import logging
from dotenv import load_dotenv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
ENV_PATH = BASE_DIR / ".env"

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


# ── LLM ──────────────────────────────────────────────────────────────────────
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL   = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()

# ── Server ────────────────────────────────────────────────────────────────────
PORT                         = int(os.getenv("PORT", "10000"))
LLM_REQUEST_TIMEOUT_SECONDS  = int(os.getenv("LLM_REQUEST_TIMEOUT_SECONDS", "45"))
RAG_RETRIEVAL_TIMEOUT_SECONDS = int(os.getenv("RAG_RETRIEVAL_TIMEOUT_SECONDS", "10"))

# ── Embeddings (lazy — loaded only on first PDF upload) ──────────────────────
EMBEDDING_MODEL      = os.getenv("EMBEDDING_MODEL", "BAAI/bge-small-en-v1.5").strip()
FASTEMBED_CACHE_PATH = os.getenv("FASTEMBED_CACHE_PATH", "").strip() or None

# ── RAG chunking ─────────────────────────────────────────────────────────────
RAG_TOP_K            = 3
RAG_CONTEXT_MAX_CHARS = 1500
CHUNK_SIZE           = 500
CHUNK_OVERLAP        = 50

# ── Upload limits ─────────────────────────────────────────────────────────────
MAX_UPLOAD_BYTES     = int(os.getenv("MAX_UPLOAD_BYTES", str(20 * 1024 * 1024)))  # 20 MB
SESSION_TTL_SECONDS  = int(os.getenv("SESSION_TTL_SECONDS", str(60 * 60)))        # 1 hour

# ── Buffer memory ─────────────────────────────────────────────────────────────
# Number of past conversation *turns* (1 turn = 1 user + 1 assistant message)
# kept in memory per session. Older turns are dropped automatically.
# Free-tier RAM tip: keep this ≤ 10. Each turn stores two short strings.
MEMORY_MAX_TURNS = int(os.getenv("MEMORY_MAX_TURNS", "10"))
