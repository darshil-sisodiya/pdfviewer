from pydantic import BaseModel
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/pdfai"
    GEMINI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "text-embedding-004"
    LLM_MODEL: str = "gemini-1.5-flash"
    CORS_ORIGINS: str = "http://localhost:5173"
    EMBEDDING_DIM: int = 768

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)


settings = Settings()