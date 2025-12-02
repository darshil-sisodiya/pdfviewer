from app.schemas.chat import ChatRequest, ChatResponse, Citation
from app.services.search_service import SearchService
from app.core.config import settings
from app.llm.clients import get_gemini_client


class ChatService:
    def __init__(self) -> None:
        self.search = SearchService()

    async def answer(self, req: ChatRequest) -> ChatResponse:
        hits = self.search.search(req.document_id, req.query, top_k=5)
        context = "\n\n".join([f"[p{h['page']}] {h['text']}" for h in hits])
        prompt = (
            "You are a helpful assistant answering questions about a PDF. "
            "Use the provided context passages and cite page numbers like [p3] when relevant.\n\n"
            f"Question: {req.query}\n\nContext:\n{context}\n\nAnswer succinctly with bullet points when useful."
        )

        genai = get_gemini_client()
        model = genai.GenerativeModel(model_name=settings.LLM_MODEL)
        resp = model.generate_content(prompt)
        text = getattr(resp, "text", None) or (resp.candidates[0].content.parts[0].text if getattr(resp, "candidates", None) else "")
        citations = [Citation(page=h["page"], snippet=h["text"][:200]) for h in hits]
        return ChatResponse(answer=text or "(no answer)", citations=citations)