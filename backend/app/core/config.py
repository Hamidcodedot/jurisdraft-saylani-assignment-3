import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Root directory of the repository (two levels up from backend/app/core)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

class Settings(BaseSettings):
    PROJECT_NAME: str = "JurisDraft"
    PROJECT_DESCRIPTION: str = "Enterprise SaaS for Automated Legal Document Drafting & Repository"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Security & Authentication
    SECRET_KEY: str = "prelegal-super-secret-production-key-2026-smit-assignment"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = f"sqlite+aiosqlite:///{BACKEND_DIR / 'prelegal.db'}"
    SYNC_DATABASE_URL: str = f"sqlite:///{BACKEND_DIR / 'prelegal.db'}"
    
    # AI Engine & Inference
    OPENROUTER_API_KEY: str = ""
    CEREBRAS_API_KEY: str = ""
    CEREBRAS_MODEL: str = "openrouter/openai/gpt-oss-120b"
    FALLBACK_MODEL: str = "cerebras/llama3.1-70b"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ]
    
    # Paths
    TEMPLATES_DIR: Path = BASE_DIR / "templates"
    CATALOG_PATH: Path = BASE_DIR / "catalog.json"
    STATIC_DIR: Path = BACKEND_DIR / "static"

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "extra": "ignore"
    }

settings = Settings()
