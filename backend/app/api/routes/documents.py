from fastapi import APIRouter, UploadFile, File, HTTPException
from typing import List

from app.services.ingest_service import IngestService

router = APIRouter()
ingest_service = IngestService()


@router.post("")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
    doc_id = await ingest_service.ingest_pdf(file)
    return {"document_id": doc_id}


@router.get("")
async def list_documents():
    return await ingest_service.list_documents()


@router.get("/{document_id}/highlights")
async def get_highlights(document_id: str):
    return await ingest_service.get_highlights(document_id)