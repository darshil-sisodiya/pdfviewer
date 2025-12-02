from fastapi import APIRouter, HTTPException
from app.schemas.chat import ChatRequest
from app.services.chat_service import ChatService

router = APIRouter()
chat_service = ChatService()


@router.post("")
async def chat_with_document(req: ChatRequest):
    if not req.document_id or not req.query:
        raise HTTPException(status_code=400, detail="document_id and query are required")
    return await chat_service.answer(req)