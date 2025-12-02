from typing import List
import google.generativeai as genai
from app.core.config import settings


class Embeddings:
    def __init__(self) -> None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not configured")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = settings.EMBEDDING_MODEL

    def _extract_values(self, emb) -> List[float]:
        """Extract embedding values - handles both list and object formats."""
        # If it's already a list of floats, return it directly
        if isinstance(emb, list):
            return emb
        # If it has a 'values' attribute (object format)
        vals = getattr(emb, "values", None)
        if vals is not None:
            return list(vals) if not isinstance(vals, list) else vals
        # If it's a dict with 'values' key
        if isinstance(emb, dict) and "values" in emb:
            return emb["values"]
        # Fallback: try to convert to list
        return list(emb)

    def embed(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        # Batch embed with google-generativeai
        # Fallback to single calls for reliability
        vectors: List[List[float]] = []
        if hasattr(genai, "embed_content"):
            # Use single embed_content which is more reliable
            for t in texts:
                r = genai.embed_content(model=self.model, content=t)
                # The response has an 'embedding' attribute which can be a list directly
                emb = getattr(r, "embedding", None)
                if emb is None and isinstance(r, dict):
                    emb = r.get("embedding")
                if emb is None:
                    raise ValueError(f"Could not extract embedding from response: {r}")
                vectors.append(self._extract_values(emb))
        else:
            raise RuntimeError("genai.embed_content not available")
        return vectors