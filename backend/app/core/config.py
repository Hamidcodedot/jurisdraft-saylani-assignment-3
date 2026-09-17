import os
from pathlib import Path
from typing import List
from pydantic_settings import BaseSettings

# Root directory of the repository (two levels up from backend/app/core)
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent

IS_SERVERLESS = bool(os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME"))

def _get_default_db_url(is_sync: bool = False) -> str:
    env_var = "SYNC_DATABASE_URL" if is_sync else "DATABASE_URL"
    if os.environ.get(env_var):
        return os.environ[env_var]
    if IS_SERVERLESS:
        db_path = Path("/tmp") / "prelegal.db"
    else:
        db_path = BACKEND_DIR / "prelegal.db"
    prefix = "sqlite:///" if is_sync else "sqlite+aiosqlite:///"
    return f"{prefix}{db_path.as_posix()}"

def _get_templates_dir() -> Path:
    candidates = [
        BASE_DIR / "templates",
        BACKEND_DIR / "templates",
        Path.cwd() / "templates",
        Path.cwd() / "backend" / "templates",
    ]
    for c in candidates:
        if c.exists() and c.is_dir():
            return c
    return BASE_DIR / "templates"

def _get_catalog_path() -> Path:
    candidates = [
        BASE_DIR / "catalog.json",
        BACKEND_DIR / "catalog.json",
        Path.cwd() / "catalog.json",
        Path.cwd() / "backend" / "catalog.json",
    ]
    for c in candidates:
        if c.exists() and c.is_file():
            return c
    return BASE_DIR / "catalog.json"

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
    DATABASE_URL: str = _get_default_db_url(is_sync=False)
    SYNC_DATABASE_URL: str = _get_default_db_url(is_sync=True)
    
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
        "https://vercel.app",
        "*"
    ]
    
    # Paths
    TEMPLATES_DIR: Path = _get_templates_dir()
    CATALOG_PATH: Path = _get_catalog_path()
    STATIC_DIR: Path = BACKEND_DIR / "static"

    model_config = {
        "env_file": str(BASE_DIR / ".env"),
        "extra": "ignore"
    }

settings = Settings()
