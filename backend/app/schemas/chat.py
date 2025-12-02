from typing import List
from pydantic import BaseModel


class ChatRequest(BaseModel):
    document_id: str
    query: str


class Citation(BaseModel):
    page: int | None = None
    snippet: str | None = None


class ChatResponse(BaseModel):
    answer: str
    citations: List[Citation]