# API Endpoints (Draft)

Base URL: `http://localhost:8000`

## Health
- `GET /health` → `{ status: "ok" }`

## Documents
- `POST /documents` (multipart form: `file`) → `{ document_id }`
- `GET /documents` → list ingested documents
- `GET /documents/{id}/highlights` → saved highlights

## Chat
- `POST /chat` → body: `{ document_id, query }` → `{ answer, citations }`

## Search
- `GET /search?document_id=...&q=...` → semantic search results