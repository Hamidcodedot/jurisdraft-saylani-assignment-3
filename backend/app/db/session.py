from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from backend.app.core.config import settings

# Async engine for non-blocking FastAPI operations
engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False}
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db():
    """Dependency that provides a transactional async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    """Create all database tables on application startup."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
