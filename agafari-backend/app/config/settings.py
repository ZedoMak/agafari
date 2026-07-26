from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Agafari API"
    DATABASE_URL: str

    @field_validator("DATABASE_URL")
    @classmethod
    def use_psycopg_driver(cls, value: str) -> str:
        """Accept the URL exactly as hosting providers hand it out.

        Render and Neon print `postgres://` or `postgresql://`, which SQLAlchemy
        resolves to psycopg2. We ship psycopg 3, so name the driver explicitly
        rather than making every deploy remember to edit the URL.
        """
        for prefix in ("postgresql+psycopg://", "postgresql+asyncpg://"):
            if value.startswith(prefix):
                return value
        for prefix in ("postgres://", "postgresql://"):
            if value.startswith(prefix):
                return "postgresql+psycopg://" + value[len(prefix) :]
        return value

    # AI Providers
    ADDIS_AI_API_KEY: str = ""
    ADDIS_AI_BASE_URL: str = "https://api.addisassistant.com/v1"
    OPENROUTER_API_KEY: str = ""
    OPENROUTER_BASE_URL: str = "https://openrouter.ai/api/v1"

    # Embedding & Chunking
    EMBEDDING_MODEL: str = "openai/text-embedding-3-small"
    EMBEDDING_DIMENSION: int = 1536
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 100

    # Generation
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_TIMEOUT_SECONDS: float = 45.0
    EMBEDDING_TIMEOUT_SECONDS: float = 30.0
    # When a provider is unreachable, answer by quoting retrieved approved text
    # instead of returning an error. Keeps demos and outages grounded.
    AI_EXTRACTIVE_FALLBACK: bool = True
    # Indexing runs in the background after startup so the API stays responsive.
    INDEX_ON_STARTUP: bool = True

    # Local development creates missing tables on boot. Deployments run
    # prestart.py instead, so several web workers never race to build a schema.
    AUTO_CREATE_TABLES: bool = True
    # Managed Postgres closes idle connections, so verify one before handing it out.
    DB_POOL_SIZE: int = 5
    DB_POOL_RECYCLE_SECONDS: int = 900

    # Demo access sessions. Organizations can override the code with a stored hash.
    DEMO_ACCESS_CODE: str = "agafari-demo"
    ACCESS_SESSION_TTL_HOURS: int = 8
    MAX_UPLOAD_BYTES: int = 10_000_000
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://localhost:3001,http://localhost:5173"
    )
    # Set on hosts where the frontend is not on an agafari.com domain, e.g.
    # a Render preview URL. Comma separated, appended to CORS_ORIGINS.
    EXTRA_CORS_ORIGINS: str = ""
    # Tenant sites are served from subdomains, so origins cannot be enumerated.
    CORS_ORIGIN_REGEX: str = (
        r"https?://([a-z0-9-]+\.)*(localhost|127\.0\.0\.1|agafari\.com)(:\d+)?"
    )

    @property
    def cors_origins(self) -> list[str]:
        raw = f"{self.CORS_ORIGINS},{self.EXTRA_CORS_ORIGINS}"
        return [origin.strip() for origin in raw.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()