from typing import List
import google.generativeai as genai
from app.core.config import settings


class Embeddings:
    def __init__(self) -> None:
        if not settings.GEMINI_API_KEY:
            raise RuntimeError("GEMINI_API_KEY not configured")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = settings.EMBEDDING_MODEL

    def embed(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        # Batch embed with google-generativeai
        # Fallback to single calls for reliability
        vectors: List[List[float]] = []
        if hasattr(genai, "embed_content") and hasattr(genai, "batch_embed_contents"):
            # Batch size 64 to be safe
            B = 64
            for i in range(0, len(texts), B):
                batch = texts[i : i + B]
                resp = genai.batch_embed_contents(model=self.model, requests=[{"content": t} for t in batch])
                embeddings = getattr(resp, "embeddings", None) or resp.get("embeddings", [])  # type: ignore
                for item in embeddings:
                    vals = getattr(item, "values", None) or item.get("values")  # type: ignore
                    vectors.append(vals)
        else:
            for t in texts:
                r = genai.embed_content(model=self.model, content=t)
                emb = getattr(r, "embedding", None) or r.get("embedding")  # type: ignore
                vals = getattr(emb, "values", None) or emb.get("values")  # type: ignore
                vectors.append(vals)
        return vectors