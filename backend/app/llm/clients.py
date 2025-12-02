import google.generativeai as genai
from app.core.config import settings


def get_gemini_client():
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured")
    genai.configure(api_key=settings.GEMINI_API_KEY)
    return genai