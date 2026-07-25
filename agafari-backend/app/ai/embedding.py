"""OpenRouter embedding client.
Generates vector embeddings via OpenRouter's /embeddings endpoint
using the text-embedding-3-small model (1536 dimensions).
"""

import httpx
from app.config.settings import settings

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.OPENROUTER_BASE_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=30.0,
        )
    return _client


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts.

    Args:
        texts: List of text strings to embed.

    Returns:
        List of embedding vectors (each a list of floats).
    """
    if not texts:
        return []

    client = _get_client()
    response = await client.post(
        "/embeddings",
        json={
            "model": settings.EMBEDDING_MODEL,
            "input": texts,
        },
    )
    response.raise_for_status()
    data = response.json()

    # Sort by index to ensure order matches input
    embeddings = sorted(data["data"], key=lambda x: x["index"])
    return [item["embedding"] for item in embeddings]


async def embed_text(text: str) -> list[float]:
    """Generate an embedding for a single text string."""
    results = await embed_texts([text])
    return results[0]
