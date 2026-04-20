# PDFSense AI

An AI-powered PDF reader that lets you read, highlight, search, and chat with documents using RAG, semantic search, and Gemini-powered insights.

## Features
- Smooth PDF viewing (PDF.js)
- Text highlighting and selection
- Chat with PDF (RAG)
- Semantic search using pgvector
- Context-aware explanations
- Gemini-powered insights and summaries

## Tech Stack
Backend: FastAPI, LlamaIndex, PostgreSQL + pgvector, Gemini API  
Frontend: React (Vite), PDF.js  
Infra: Docker Compose  

## Installation

Clone the repository:
git clone https://github.com/darshil-sisodiya/pdfviewer.git
cd pdfviewer

Setup environment variables:
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

Fill in required values (DB, API keys, etc.)

Run with Docker:
docker compose -f infra/docker-compose.yml up -d

OR run locally:

Backend:
cd backend
python -m venv venv
source venv/bin/activate   (Windows: venv\Scripts\activate)
pip install -r requirements.txt
uvicorn app:app --reload

Frontend:
cd frontend
npm install
npm run dev

## Folder Structure

.
├── backend/        # FastAPI + LlamaIndex + DB logic
├── frontend/       # React + PDF.js UI
├── infra/          # Docker setup
├── docs/           # Architecture + API docs
└── README.md

## How It Works

1. PDFs are parsed and chunked using LlamaIndex  
2. Embeddings stored in PostgreSQL (pgvector)  
3. Queries use semantic retrieval (RAG)  
4. Gemini generates final responses  

## Future Improvements
- Annotations
- Multi-document chat
- User auth
- Export insights

## License
MIT

Built by Darshil
