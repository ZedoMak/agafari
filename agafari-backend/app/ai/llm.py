"""Addis AI LLM client.

Sends chat completion requests to the Addis AI API (OpenAI-compatible
/chat/completions endpoint). Callers receive `LLMUnavailable` when the provider
is unconfigured or failing, so they can fall back to extractive answers rather
than surfacing an error to the visitor.
"""

import httpx
from app.config.settings import settings

_client: httpx.AsyncClient | None = None


class LLMUnavailable(RuntimeError):
    """Raised when the language model cannot be reached."""


def is_configured() -> bool:
    return bool(settings.ADDIS_AI_API_KEY)


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.ADDIS_AI_BASE_URL,
            headers={
                "Authorization": f"Bearer {settings.ADDIS_AI_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=settings.LLM_TIMEOUT_SECONDS,
        )
    return _client


async def chat_completion(
    messages: list[dict],
    model: str | None = None,
    temperature: float = 0.3,
) -> str:
    """Send a chat completion request to Addis AI.

    Raises:
        LLMUnavailable: if the provider is unconfigured or the call fails.
    """
    if not is_configured():
        raise LLMUnavailable("ADDIS_AI_API_KEY is not set")

    client = _get_client()
    try:
        response = await client.post(
            "/chat/completions",
            json={
                "model": model or settings.LLM_MODEL,
                "messages": messages,
                "temperature": temperature,
            },
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
    except (httpx.HTTPError, KeyError, IndexError, ValueError) as exc:
        raise LLMUnavailable(str(exc)) from exc
