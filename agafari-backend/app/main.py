import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.ai import embedding as embed_client
from app.ai import llm
from app.database.session import init_db, async_session
from app.config.settings import settings
import app.models
from app.routers import (
    access,
    admin,
    admin_services,
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


async def _index_pending_sources() -> None:
    """Index approved sources that have no embeddings yet."""
    try:
        from app.ai.indexer import index_all_sources

        async with async_session() as db:
            count = await index_all_sources(db)
            if count > 0:
                print(f"✅ Indexed {count} new chunks into vector store")
    except Exception as exc:
        print(f"⚠️  Auto-indexing skipped: {exc}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup: prepare the schema locally, then index in the background."""
    if settings.AUTO_CREATE_TABLES:
        await init_db()
        print("✅ Database initialized (pgvector enabled, tables created)")

    # Indexing calls an external embedding provider, so it must never block the
    # API from accepting requests.
    background: set[asyncio.Task] = set()
    if settings.INDEX_ON_STARTUP:
        task = asyncio.create_task(_index_pending_sources())
        background.add(task)
        task.add_done_callback(background.discard)

    yield

    for task in list(background):
        task.cancel()
    print("Shutting down Agafari API")


app = FastAPI(
    title="አጋፋሪ (Agafari) API",
    description="Hosted public and internal knowledge intelligence for organizations",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Tenant sites run on their own subdomains, which cannot be enumerated.
    allow_origin_regex=settings.CORS_ORIGIN_REGEX or None,
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
app.include_router(admin_services.router)
app.include_router(dashboard.router)


@app.get("/")
async def health_check():
    return {
        "status": "online",
        "app": "አጋፋሪ (Agafari) Backend",
        "ai": {
            "llm": llm.is_configured(),
            "embeddings": embed_client.is_configured(),
            "extractive_fallback": settings.AI_EXTRACTIVE_FALLBACK,
        },
    }