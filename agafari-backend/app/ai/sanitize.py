"""Keep generated answers in the organization's voice.

The upstream model sometimes introduces itself ("Addis Assistant by Addis AI.")
and prompt instructions alone do not stop it. Visitors are on the
organization's own site, so any platform or vendor identity is stripped before
the answer is stored or returned.
"""

import re

_VENDOR_PATTERNS = [
    re.compile(r"^\s*addis\s+assistant[^\n]*\n?", re.IGNORECASE),
    re.compile(r"\baddis\s+assistant\b(\s+by\s+addis\s+ai)?[.,]?", re.IGNORECASE),
    re.compile(r"\b(powered|provided|built)\s+by\s+addis\s+ai\b[.,]?", re.IGNORECASE),
    re.compile(r"\baddis\s+ai\b[.,]?", re.IGNORECASE),
    re.compile(r"^\s*(i am|this is)\s+agafari\b[^\n]*\n?", re.IGNORECASE),
    re.compile(r"\bagafari\s+(assistant|platform)\b[.,]?", re.IGNORECASE),
]


def strip_vendor_identity(text: str) -> str:
    """Remove vendor self-identification while leaving the answer intact."""
    if not text:
        return text

    cleaned = text
    for pattern in _VENDOR_PATTERNS:
        cleaned = pattern.sub("", cleaned)

    # Collapse the blank lines left behind by a removed opening line.
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()
