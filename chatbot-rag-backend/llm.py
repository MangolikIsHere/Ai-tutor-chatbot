"""
llm.py — thin wrapper around the Groq chat completions API.

ask_llm() accepts:
  • system_prompt  — sets the assistant's persona / instructions
  • messages       — full conversation history (user + assistant turns)
                     in Groq's native format: [{"role": ..., "content": ...}]

The Groq client is instantiated once and reused (lru_cache).
"""

from __future__ import annotations

import logging
import os
from functools import lru_cache

logger = logging.getLogger(__name__)


def _groq_api_key() -> str:
    return os.getenv("GROQ_API_KEY", "").strip()


def _groq_model() -> str:
    return os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()


@lru_cache(maxsize=1)
def _get_client():
    key = _groq_api_key()
    if not key:
        raise RuntimeError("GROQ_API_KEY is not set")
    from groq import Groq  # lazy import
    logger.info("Creating Groq client (model=%s)", _groq_model())
    return Groq(api_key=key)


def ask_llm(
    system_prompt: str,
    messages: list[dict[str, str]],
) -> str:
    """
    Call the Groq API with a system prompt and full message history.

    Args:
        system_prompt: Instructions / persona for the assistant.
        messages:      List of {"role": "user"|"assistant", "content": str}.
                       Must end with a user message.

    Returns:
        The assistant's reply as a plain string.

    Raises:
        RuntimeError: On API errors (caller handles HTTP translation).
    """
    if not messages:
        return "Please provide a message."

    client = _get_client()

    payload = [{"role": "system", "content": system_prompt}, *messages]

    try:
        response = client.chat.completions.create(
            model=_groq_model(),
            messages=payload,
            temperature=0.4,
            max_tokens=1024,
        )
    except Exception as e:
        raise RuntimeError(f"Groq request failed: {e}") from e

    if not response.choices:
        return "No response"

    content = getattr(response.choices[0].message, "content", None)
    return (content or "No response").strip()
