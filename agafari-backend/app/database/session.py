import ssl as _ssl
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.config.settings import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    # Managed Postgres (Neon, Render) drops idle connections, which surfaces as
    # a dead pooled connection on the next request unless we check first.
    pool_pre_ping=True,
    pool_size=settings.DB_POOL_SIZE,
    pool_recycle=settings.DB_POOL_RECYCLE_SECONDS,
)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


async def get_db():
    """Yield an async database session for FastAPI dependency injection."""
    async with async_session() as session:
        yield session


async def init_db():
    """Create all tables and enable pgvector extension."""
    async with engine.begin() as conn:
        await conn.execute(text("CREATE EXTENSION IF NOT EXISTS vector"))
        await conn.run_sync(Base.metadata.create_all)