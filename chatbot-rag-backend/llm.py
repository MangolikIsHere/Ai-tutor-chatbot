import logging
import time
from functools import lru_cache

from config import GOOGLE_API_KEY, GEMINI_MODEL, GEMINI_MAX_OUTPUT_TOKENS

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

    except ImportError:
        import google.generativeai as genai

        genai.configure(api_key=GOOGLE_API_KEY)

        logger.info("Using google-generativeai SDK")

        return {
            "sdk": "legacy",
            "client": genai.GenerativeModel(GEMINI_MODEL)
        }


def ask_gemini(prompt: str) -> str:
    if not prompt or not prompt.strip():
        return "Please provide a message."

    started = time.perf_counter()

    try:
        gemini = get_gemini_client()

        if gemini["sdk"] == "google-genai":
            response = gemini["client"].models.generate_content(
                model=GEMINI_MODEL,
                contents=prompt,
                config={
                    "temperature": 0.5,
                    "max_output_tokens": GEMINI_MAX_OUTPUT_TOKENS
                }
            )

            logger.info("Gemini response time: %.2f ms", (time.perf_counter() - started) * 1000)

            return response.text or "No response"

        response = gemini["client"].generate_content(
            prompt,
            generation_config={
                "temperature": 0.5,
                "max_output_tokens": GEMINI_MAX_OUTPUT_TOKENS,
            },
        )

        logger.info("Gemini response time: %.2f ms", (time.perf_counter() - started) * 1000)

        return getattr(response, "text", None) or "No response"

    except Exception as e:
        logger.exception("Gemini failed: %s", e)
        return "Sorry, I could not generate a response right now."