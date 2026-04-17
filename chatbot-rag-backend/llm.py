import logging
from functools import lru_cache

from config import GOOGLE_API_KEY, GEMINI_MODEL

logger = logging.getLogger(__name__)


@lru_cache(maxsize=1)
def get_gemini_client():
    if not GOOGLE_API_KEY:
        raise RuntimeError("GOOGLE_API_KEY not set")

    try:
        from google import genai

        client = genai.Client(api_key=GOOGLE_API_KEY)

        logger.info("Using google-genai SDK")

        return {
            "sdk": "google-genai",
            "client": client
        }

    except Exception:
        import google.generativeai as genai

        genai.configure(api_key=GOOGLE_API_KEY)

        logger.info("Using google-generativeai SDK")

        return {
            "sdk": "legacy",
            "client": genai.GenerativeModel(GEMINI_MODEL)
        }


def ask_gemini(prompt: str) -> str:
    try:
        gemini = get_gemini_client()

        if gemini["sdk"] == "google-genai":
            response = gemini["client"].models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={
                    "temperature": 0.3,
                    "max_output_tokens": 350
                }
            )

            return response.text or "No response"

        response = gemini["client"].generate_content(prompt)

        return getattr(response, "text", None) or "No response"

    except Exception as e:
        logger.exception("Gemini failed: %s", e)
        return "Sorry, I could not generate a response right now."