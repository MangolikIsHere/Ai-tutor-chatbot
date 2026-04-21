import os
from functools import lru_cache

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "").strip()
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile").strip()


def _has_value(value: str) -> bool:
    return bool(value)


@lru_cache(maxsize=1)
def get_client():
    if not _has_value(GROQ_API_KEY):
        raise RuntimeError("GROQ_API_KEY is not set")

    from groq import Groq
    return Groq(api_key=GROQ_API_KEY)


def ask_llm(prompt: str) -> str:
    if not prompt or not prompt.strip():
        return "Please provide a message."

    try:
        client = get_client()

        response = client.chat.completions.create(
            model=GROQ_MODEL,
            messages=[
                {
                    "role": "user",
                    "content": prompt.strip()
                }
            ],
            temperature=0.4,
            max_tokens=1024,
        )

        if not response.choices:
            return "No response"

        message = response.choices[0].message
        content = getattr(message, "content", None)

        if not content:
            return "No response"

        return content.strip()

    except Exception as e:
        raise RuntimeError(f"Groq request failed: {str(e)}")