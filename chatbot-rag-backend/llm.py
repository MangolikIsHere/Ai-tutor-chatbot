import os
import logging
from functools import lru_cache

logger = logging.getLogger(__name__)


def _groq_api_key() -> str:
    return os.getenv("GROQ_API_KEY", "").strip()


def _groq_model() -> str:
    return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()


@lru_cache(maxsize=1)
def _get_client():
    """
    Instantiated once and reused. Import is deferred so the module loads
    instantly even if groq is not yet installed in the build phase.
    """
    key = _groq_api_key()
    if not key:
        raise RuntimeError("GROQ_API_KEY is not set")

    from groq import Groq  # lazy import

    logger.info("Creating Groq client (model=%s)", _groq_model())
    return Groq(api_key=key)


def ask_llm(prompt: str) -> str:
    if not prompt or not prompt.strip():
        return "Please provide a message."

    client = _get_client()

    try:
        response = client.chat.completions.create(
            model=_groq_model(),
            messages=[{"role": "user", "content": prompt.strip()}],
            temperature=0.4,
            max_tokens=1024,
        )
    except Exception as e:
        raise RuntimeError(f"Groq request failed: {e}") from e

    if not response.choices:
        return "No response"

    content = getattr(response.choices[0].message, "content", None)
    return (content or "No response").strip()
