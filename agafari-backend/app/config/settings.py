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

    class Config:
        env_file = ".env"


settings = Settings()