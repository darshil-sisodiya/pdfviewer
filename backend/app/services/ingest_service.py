from typing import Any, Dict, List
import uuid
from fastapi import UploadFile
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.db.models import Document, Chunk
from app.services.pdf_processing import extract_text
from app.utils.text import chunk_text
from app.utils.file import save_upload_to_tmp
from app.services.embeddings import Embeddings


class IngestService:
    def __init__(self) -> None:
        self.embedder = Embeddings()

    async def ingest_pdf(self, file: UploadFile) -> str:
        path = save_upload_to_tmp(file)
        pages = extract_text(path)

        doc_id = uuid.uuid4().hex
        chunks_text: List[str] = []
        chunk_meta: List[Dict[str, Any]] = []

        for i, page_text in enumerate(pages, start=1):
            for ch in chunk_text(page_text):
                chunks_text.append(ch)
                chunk_meta.append({"page": i})

        vectors = self.embedder.embed(chunks_text)

        with SessionLocal() as db:  # type: Session
            db.add(Document(id=doc_id, name=file.filename))
            for text, vec, meta in zip(chunks_text, vectors, chunk_meta):
                db.add(Chunk(id=uuid.uuid4().hex, document_id=doc_id, page=meta["page"], text=text, embedding=vec))
            db.commit()
        return doc_id

    async def list_documents(self) -> List[Dict[str, Any]]:
        with SessionLocal() as db:  # type: Session
            rows = db.execute(select(Document.id, Document.name)).all()
            return [{"id": r.id, "name": r.name} for r in rows]

    async def get_highlights(self, document_id: str) -> List[Dict[str, Any]]:
        # Placeholder: highlight persistence not implemented yet
        return []