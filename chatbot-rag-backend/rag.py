import logging
import threading
from functools import lru_cache

from config import (
    ENABLE_RAG,
    EMBEDDING_BACKEND,
    EMBEDDING_MODEL,
    FASTEMBED_CACHE_PATH,
    PDF_PATH,
    FAISS_INDEX_DIR,
    RAG_TOP_K,
    RAG_CONTEXT_MAX_CHARS,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)
from prompts import ML_KEYWORDS
from langchain_core.embeddings import Embeddings

logger = logging.getLogger(__name__)

_retriever = None
_init_lock = threading.Lock()
_init_done = False


def is_ml_query(query: str) -> bool:
    q = query.lower()
    return any(kw in q for kw in ML_KEYWORDS)


class FastEmbedLangChainEmbeddings(Embeddings):
    def __init__(self, model_name: str, cache_dir: str | None = None):
        from fastembed import TextEmbedding

        self._model = TextEmbedding(model_name=model_name, cache_dir=cache_dir)

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [embedding.tolist() for embedding in self._model.embed(texts)]

    def embed_query(self, text: str) -> list[float]:
        return list(self._model.query_embed([text]))[0].tolist()


@lru_cache(maxsize=1)
def _get_embeddings():
    if EMBEDDING_BACKEND != "fastembed":
        raise RuntimeError(f"Unsupported EMBEDDING_BACKEND: {EMBEDDING_BACKEND}")

    logger.info("Loading FastEmbed embeddings (model=%s)", EMBEDDING_MODEL)
    return FastEmbedLangChainEmbeddings(
        model_name=EMBEDDING_MODEL,
        cache_dir=FASTEMBED_CACHE_PATH,
    )


@lru_cache(maxsize=1)
def _get_vector_store():
    if not ENABLE_RAG:
        return None

    try:
        from langchain_community.vectorstores import FAISS

        embeddings = _get_embeddings()

        # Fast path: pre-built index already on disk
        if FAISS_INDEX_DIR.exists() and any(FAISS_INDEX_DIR.iterdir()):
            logger.info("Loading FAISS index from %s", FAISS_INDEX_DIR)
            return FAISS.load_local(
                str(FAISS_INDEX_DIR),
                embeddings,
                allow_dangerous_deserialization=True,
            )

        # Slow path: build from PDF (first run only)
        if not PDF_PATH.exists():
            logger.warning("No PDF and no FAISS index — RAG disabled")
            return None

        logger.info("Building FAISS index from PDF (first run)...")
        from langchain_community.document_loaders import PyPDFLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        docs = PyPDFLoader(str(PDF_PATH)).load()
        chunks = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        ).split_documents(docs)

        db = FAISS.from_documents(chunks, embeddings)
        FAISS_INDEX_DIR.mkdir(parents=True, exist_ok=True)
        db.save_local(str(FAISS_INDEX_DIR))
        logger.info("FAISS index saved to %s", FAISS_INDEX_DIR)
        return db

    except MemoryError:
        logger.error("OOM while loading vector store — free tier RAM exceeded")
        return None
    except Exception:
        logger.exception("Failed to initialise vector store")
        return None


def warm_rag() -> None:
    global _retriever, _init_done

    with _init_lock:
        if _init_done:
            return
        _init_done = True

    try:
        db = _get_vector_store()
        if db is not None:
            _retriever = db.as_retriever(search_kwargs={"k": RAG_TOP_K})
            logger.info("RAG retriever ready")
        else:
            logger.warning("RAG retriever unavailable")
    except Exception:
        logger.exception("warm_rag failed")


def retrieve_context(query: str) -> str | None:
    if not ENABLE_RAG:
        return None

    if not is_ml_query(query):
        return None

    if _retriever is None:
        warm_rag()

    if _retriever is None:
        return None

    try:
        docs = _retriever.invoke(query)
        text = " ".join(d.page_content for d in docs)
        return text[:RAG_CONTEXT_MAX_CHARS] or None
    except Exception:
        logger.warning("Retrieval failed", exc_info=True)
        return None
