from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes.health import router as health_router
from app.api.routes.documents import router as documents_router
from app.api.routes.chat import router as chat_router
from app.api.routes.search import router as search_router
from app.db.session import engine
from app.db.models import Base


app = FastAPI(title="AI PDF Reader API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.CORS_ORIGINS.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"]
    ,allow_headers=["*"]
)

app.include_router(health_router, tags=["health"])
app.include_router(documents_router, prefix="/documents", tags=["documents"])
app.include_router(chat_router, prefix="/chat", tags=["chat"])
app.include_router(search_router, prefix="/search", tags=["search"])


@app.get("/")
def root():
    return {"name": "AI PDF Reader API"}


@app.on_event("startup")
def on_startup():
    with engine.begin() as conn:
        try:
            conn.exec_driver_sql("CREATE EXTENSION IF NOT EXISTS vector;")
        except Exception:
            pass
        Base.metadata.create_all(bind=conn)