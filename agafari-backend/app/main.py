from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database.session import init_db, async_session
import app.models
from app.routers import services, offices, chat, admin, sources, agencies


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
    description="Digital Navigation & Guidance Layer for Ethiopian Public Services",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all the routers
app.include_router(agencies.router)
app.include_router(sources.router)
app.include_router(services.router)
app.include_router(offices.router)
app.include_router(chat.router)
app.include_router(admin.router)


@app.get("/")
async def health_check():
    return {"status": "online", "app": "አጋፋሪ (Agafari) Backend"}