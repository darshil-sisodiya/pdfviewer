import logging
from app.schemas.chat import ChatRequest, ChatResponse, Citation
from app.services.search_service import SearchService
from app.core.config import settings
from app.llm.clients import get_gemini_client

logger = logging.getLogger(__name__)


class ChatService:
    def __init__(self) -> None:
        self.search = SearchService()

    async def answer(self, req: ChatRequest) -> ChatResponse:
        logger.info(f"Processing chat request for document {req.document_id}")
        
        try:
            hits = self.search.search(req.document_id, req.query, top_k=5)
            logger.info(f"Found {len(hits)} relevant chunks")
        except Exception as e:
            logger.error(f"Search failed: {e}")
            # If search fails (e.g., no chunks yet), just use the query directly
            hits = []
        
        if hits:
            context = "\n\n".join([f"[p{h['page']}] {h['text']}" for h in hits])
            prompt = (
                "You are a helpful assistant answering questions about a PDF. "
                "Use the provided context passages and cite page numbers like [p3] when relevant.\n\n"
                f"Question: {req.query}\n\nContext:\n{context}\n\nAnswer succinctly with bullet points when useful."
            )
        else:
            # No context available, just answer the question directly
            prompt = f"You are a helpful assistant. Please answer this question:\n\n{req.query}"
        
        try:
            genai = get_gemini_client()
            model = genai.GenerativeModel(model_name=settings.LLM_MODEL)
            logger.info(f"Calling Gemini model: {settings.LLM_MODEL}")
            resp = model.generate_content(prompt)
            text = getattr(resp, "text", None) or (resp.candidates[0].content.parts[0].text if getattr(resp, "candidates", None) else "")
            logger.info(f"Gemini response received, length: {len(text) if text else 0}")
        except Exception as e:
            logger.error(f"Gemini API call failed: {e}")
            return ChatResponse(answer=f"Error calling AI: {str(e)}", citations=[])
        
        citations = [Citation(page=h["page"], snippet=h["text"][:200]) for h in hits]
        return ChatResponse(answer=text or "(no answer)", citations=citations)