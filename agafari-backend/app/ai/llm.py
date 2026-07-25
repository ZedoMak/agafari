"""Addis AI LLM client.

Sends chat completion requests to the Addis AI API
(OpenAI-compatible /chat/completions endpoint).
"""

import httpx
from app.config.settings import settings

_client: httpx.AsyncClient | None = None


def _get_client() -> httpx.AsyncClient:
    global _client
    if _client is None:
        _client = httpx.AsyncClient(
            base_url=settings.ADDIS_AI_BASE_URL,
            headers={
                "Authorization": f"Bearer {settings.ADDIS_AI_API_KEY}",
                "Content-Type": "application/json",
            },
            timeout=60.0,
        )
    return _client


async def chat_completion(
    messages: list[dict],
    model: str = "gpt-4o-mini",
    temperature: float = 0.3,
) -> str:
    """Send a chat completion request to Addis AI.

    Args:
        messages: List of message dicts with 'role' and 'content'.
        model: The model to use.
        temperature: Sampling temperature (lower = more deterministic).

    Returns:
        The assistant's reply as a string.
    """
    client = _get_client()
    response = await client.post(
        "/chat/completions",
        json={
            "model": model,
            "messages": messages,
            "temperature": temperature,
        },
    )
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"]
