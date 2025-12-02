import logging
from typing import List, Dict, Any
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.services.embeddings import Embeddings

logger = logging.getLogger(__name__)


class SearchService:
    def __init__(self) -> None:
        self.embedder = Embeddings()

    def search(self, document_id: str, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        logger.info(f"Searching for '{query[:50]}...' in document {document_id}")
        
        qvec = self.embedder.embed([query])[0]
        # Convert list to string format for pgvector: '[0.1, 0.2, ...]'
        vec_str = '[' + ','.join(str(v) for v in qvec) + ']'
        
        sql = text(
            """
            SELECT id, page, text, (embedding <=> :qvec::vector) AS distance
            FROM chunks
            WHERE document_id = :doc
            ORDER BY distance ASC
            LIMIT :k
            """
        )
        
        with SessionLocal() as db:  # type: Session
            rows = db.execute(sql, {"qvec": vec_str, "doc": document_id, "k": top_k}).mappings().all()
            logger.info(f"Found {len(rows)} matching chunks")
            return [{"id": r["id"], "page": r["page"], "text": r["text"], "score": float(r["distance"]) } for r in rows]