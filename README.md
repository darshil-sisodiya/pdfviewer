# PDFSense AI
AI-powered PDF reader with chat, semantic search, and contextual insights.

## Features
- Fast PDF viewing (PDF.js)
- Text highlight + selection
- Chat with PDF (RAG via LlamaIndex)
- Semantic search (pgvector)
- Gemini-powered explanations and summaries

## Tech Stack
Backend: FastAPI, LlamaIndex, PostgreSQL (pgvector), Gemini API  
Frontend: React (Vite), PDF.js  
Infra: Docker Compose  

## Setup

Clone:
```bash
git clone https://github.com/darshil-sisodiya/pdfviewer.git
cd pdfviewer
```

Env:
```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Run (Docker):
```bash
docker compose -f infra/docker-compose.yml up -d
```

Local dev:

Backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload
```

Frontend:
```bash
cd frontend
npm install
npm run dev
```

## Structure
```bash
├── backend/        # FastAPI backend, LlamaIndex, DB logic
│   ├── app/        # Core application code
│   ├── models/     # DB models
│   ├── services/   # Business logic
│   └── requirements.txt
│
├── frontend/       # React + Vite + PDF.js UI
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
│
├── infra/          # Docker + database setup
│   └── docker-compose.yml
│
├── docs/           # Architecture and API docs
│   ├── architecture.md
│   └── api.md
│
└── README.md
```

## Flow
PDF → chunk → embeddings → pgvector → retrieve → Gemini → answer

## License
MIT
