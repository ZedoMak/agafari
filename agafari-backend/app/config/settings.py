from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    APP_NAME: str = "Agafari API"
    DATABASE_URL: str

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

    # Demo access sessions. Organizations can override the code with a stored hash.
    DEMO_ACCESS_CODE: str = "agafari-demo"
    ACCESS_SESSION_TTL_HOURS: int = 8
    MAX_UPLOAD_BYTES: int = 10_000_000
    CORS_ORIGINS: str = (
        "http://localhost:3000,http://localhost:3001,http://localhost:5173"
    )
    # Tenant sites are served from subdomains, so origins cannot be enumerated.
    CORS_ORIGIN_REGEX: str = (
        r"https?://([a-z0-9-]+\.)*(localhost|127\.0\.0\.1|agafari\.com)(:\d+)?"
    )

    class Config:
        env_file = ".env"


settings = Settings()