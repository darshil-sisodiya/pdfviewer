from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.embeddings import Embeddings


class SearchService:
    def __init__(self) -> None:
        self.embedder = Embeddings()

    def search(self, document_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        qvec = self.embedder.embed([query])[0]
        sql = text(
            """
            SELECT id, page, text, (embedding <=> :qvec) AS distance
            FROM chunks
            WHERE document_id = :doc
            ORDER BY distance ASC
            LIMIT :k
            """
        )
        with SessionLocal() as db:  # type: Session
            rows = db.execute(sql, {"qvec": qvec, "doc": document_id, "k": top_k}).mappings().all()
            return [{"id": r["id"], "page": r["page"], "text": r["text"], "score": float(r["distance"]) } for r in rows]