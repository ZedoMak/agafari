"""OpenRouter embedding client.

Generates vector embeddings via OpenRouter's /embeddings endpoint. When the
provider is not configured or unreachable the caller receives
`EmbeddingUnavailable` so it can degrade to keyword-only retrieval instead of
failing the request.
"""

import httpx
from app.config.settings import settings

_client: httpx.AsyncClient | None = None


class EmbeddingUnavailable(RuntimeError):
    """Raised when embeddings cannot be produced (no key, or provider error)."""


def is_configured() -> bool:
    return bool(settings.OPENROUTER_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.OPENROUTER_BASE_URL,
            headers={
                "Authorization": f"Bearer {settings.OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=settings.EMBEDDING_TIMEOUT_SECONDS,
        )
    return _client


async def embed_texts(texts: list[str]) -> list[list[float]]:
    """Generate embeddings for a batch of texts.

    Raises:
        EmbeddingUnavailable: if the provider is unconfigured or the call fails.
    """
    if not texts:
        return []

    if not is_configured():
        raise EmbeddingUnavailable("OPENROUTER_API_KEY is not set")

    client = _get_client()
    try:
        response = await client.post(
            "/embeddings",
            json={
                "model": settings.EMBEDDING_MODEL,
                "input": texts,
            },
        )
        response.raise_for_status()
        data = response.json()
    except (httpx.HTTPError, KeyError, ValueError) as exc:
        raise EmbeddingUnavailable(str(exc)) from exc

    try:
        # Sort by index to ensure order matches input
        embeddings = sorted(data["data"], key=lambda x: x["index"])
        return [item["embedding"] for item in embeddings]
    except (KeyError, TypeError) as exc:
        raise EmbeddingUnavailable(f"Unexpected embedding payload: {exc}") from exc


async def embed_text(text: str) -> list[float]:
    """Generate an embedding for a single text string."""
    results = await embed_texts([text])
    return results[0]
