from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

# Async engine for non-blocking FastAPI operations
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False, "timeout": 30}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

# Ensure all models are registered with Base metadata
def _ensure_models():
    try:
        from app.db import models  # noqa: F401
    except ImportError:
        try:
            from backend.app.db import models  # noqa: F401
        except ImportError:
            pass

_ensure_models()

_db_initialized = False

async def init_db():
    """Create all database tables on application startup or lazy init."""
    _ensure_models()
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    """Dependency that provides a transactional async database session with lazy auto-initialization."""
    global _db_initialized
    if not _db_initialized:
        try:
            await init_db()
            _db_initialized = True
        except Exception as e:
            print(f"[!] Lazy DB init notice: {e}")
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
