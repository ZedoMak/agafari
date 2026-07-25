from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import init_db, async_session
from app.config.settings import settings
import app.models
from app.routers import (
    access,
    admin,
    agencies,
    chat,
    complaints,
    dashboard,
    documents,
    offices,
    organizations,
    saas_chat,
    services,
    sources,
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: create tables + pgvector extension, index un-indexed sources."""
    await init_db()
    print("✅ Database initialized (pgvector enabled, tables created)")

    # Index any sources that haven't been chunked yet
    try:
        from app.ai.indexer import index_all_sources
        async with async_session() as db:
            count = await index_all_sources(db)
            if count > 0:
                print(f"✅ Indexed {count} new chunks into vector store")
    except Exception as e:
        print(f"⚠️  Auto-indexing skipped: {e}")

    yield
    print("Shutting down Agafari API")


app = FastAPI(
    title="አጋፋሪ (Agafari) API",
    description="Hosted public and internal knowledge intelligence for organizations",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        origin.strip()
        for origin in settings.CORS_ORIGINS.split(",")
        if origin.strip()
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all the routers
app.include_router(organizations.router)
app.include_router(access.router)
app.include_router(agencies.router)
app.include_router(sources.router)
app.include_router(documents.router)
app.include_router(services.router)
app.include_router(offices.router)
app.include_router(chat.router)
app.include_router(saas_chat.router)
app.include_router(complaints.router)
app.include_router(admin.router)
app.include_router(dashboard.router)


@app.get("/")
async def health_check():
    return {"status": "online", "app": "አጋፋሪ (Agafari) Backend"}