# Architecture Overview

This project consists of a FastAPI backend and a React (Vite) frontend.

## Backend (FastAPI)

- Ingestion: accept PDFs, extract text + metadata, chunk and embed via LlamaIndex.
- Storage: PostgreSQL with `pgvector` stores chunks + embeddings.
- Retrieval: semantic search over embeddings; RAG context construction.
- LLM: Gemini API for explanations, Q&A, and summaries.

## Frontend (React + PDF.js)

- PDF viewing via PDF.js, selection-based highlighting.
- Chat panel with document-aware RAG responses.
- Semantic search UI over document sections.

## Data Flow

1) User uploads a PDF (frontend) → backend ingestion.
2) Backend extracts + chunks → embed → store in Postgres/pgvector.
3) Chat/query: retrieve top-k chunks → build prompt → Gemini completion.
4) Frontend renders answer with citations/highlights.