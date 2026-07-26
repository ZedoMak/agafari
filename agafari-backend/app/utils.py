"""Small shared helpers with no framework or database dependencies."""

import re

_NON_SLUG = re.compile(r"[^a-z0-9]+")
MAX_SLUG_LENGTH = 200


def slugify(value: str, fallback: str = "service") -> str:
    """Turn a title into a URL slug.

    Scripts outside the ASCII range (Amharic titles, for example) leave nothing
    usable behind, so the caller gets `fallback` and disambiguates by suffix.
    """
    slug = _NON_SLUG.sub("-", (value or "").lower()).strip("-")
    slug = slug[:MAX_SLUG_LENGTH].strip("-")
    return slug or fallback


def next_available_slug(base: str, taken) -> str:
    """`base`, or `base-2`, `base-3`, … until one is free."""
    taken = set(taken)
    if base not in taken:
        return base
    suffix = 2
    while f"{base}-{suffix}" in taken:
        suffix += 1
    return f"{base}-{suffix}"
