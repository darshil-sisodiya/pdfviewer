from fastapi import APIRouter, HTTPException
from app.services.search_service import SearchService

router = APIRouter()
search_service = SearchService()


@router.get("")
def search(document_id: str, q: str, top_k: int = 5):
    if not document_id or not q:
        raise HTTPException(status_code=400, detail="document_id and q are required")
    return {"results": search_service.search(document_id, q, top_k)}