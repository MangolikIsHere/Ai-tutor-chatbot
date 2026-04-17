import logging
from functools import lru_cache

from config import (
    ENABLE_RAG,
    PDF_PATH,
    FAISS_INDEX_DIR,
    EMBEDDING_MODEL,
    RAG_TOP_K,
    RAG_CONTEXT_MAX_CHARS,
    CHUNK_SIZE,
    CHUNK_OVERLAP
)

from prompts import ML_KEYWORDS

logger = logging.getLogger(__name__)

retriever = None


def is_ml_query(query: str) -> bool:
    q = query.lower()
    return any(word in q for word in ML_KEYWORDS)


@lru_cache(maxsize=1)
def get_embeddings():
    if not ENABLE_RAG:
        raise RuntimeError("RAG disabled")

    from langchain_huggingface import HuggingFaceEmbeddings

    logger.info("Loading embeddings...")

    return HuggingFaceEmbeddings(
        model_name=EMBEDDING_MODEL
    )


@lru_cache(maxsize=1)
def get_vector_store():
    if not ENABLE_RAG:
        return None

    try:
        from langchain_community.vectorstores import FAISS
        from langchain_community.document_loaders import PyPDFLoader
        from langchain_text_splitters import RecursiveCharacterTextSplitter

        embeddings = get_embeddings()

        if FAISS_INDEX_DIR.exists():
            logger.info("Loading FAISS index from disk")

            return FAISS.load_local(
                str(FAISS_INDEX_DIR),
                embeddings,
                allow_dangerous_deserialization=True
            )

        if not PDF_PATH.exists():
            logger.warning("PDF not found")

            return None

        logger.info("Creating FAISS index from PDF")

        docs = PyPDFLoader(str(PDF_PATH)).load()

        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP
        )

        chunks = splitter.split_documents(docs)

        db = FAISS.from_documents(chunks, embeddings)

        db.save_local(str(FAISS_INDEX_DIR))

        return db

    except Exception as e:
        logger.exception("Vector store failed: %s", e)
        return None


def warm_rag():
    global retriever

    try:
        db = get_vector_store()

        if db:
            retriever = db.as_retriever(
                search_kwargs={"k": RAG_TOP_K}
            )

            logger.info("Retriever warmed")

    except Exception as e:
        logger.warning("Warmup failed: %s", e)


def retrieve_context(query: str):
    global retriever

    if not ENABLE_RAG:
        return None

    if not is_ml_query(query):
        return None

    try:
        if retriever is None:
            warm_rag()

        if retriever is None:
            return None

        docs = retriever.invoke(query)

        text = " ".join(doc.page_content for doc in docs)

        return text[:RAG_CONTEXT_MAX_CHARS]

    except Exception as e:
        logger.warning("Retrieval failed: %s", e)
        return None