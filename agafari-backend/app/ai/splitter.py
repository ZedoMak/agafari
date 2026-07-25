"""Lightweight recursive text splitter — no LangChain dependency.

Splits text into overlapping chunks by trying paragraph boundaries first,
then sentence boundaries, then word boundaries.
"""

from dataclasses import dataclass
from app.config.settings import settings


@dataclass
class ChunkData:
    """A single text chunk with its positional index."""
    content: str
    index: int


def chunk_text(
    text: str,
    chunk_size: int = settings.CHUNK_SIZE,
    chunk_overlap: int = settings.CHUNK_OVERLAP,
) -> list[ChunkData]:
    """Split text into overlapping chunks.

    Tries to split on natural boundaries in this order:
    1. Double newlines (paragraphs)
    2. Single newlines
    3. Sentences ('. ')
    4. Spaces (words)
    """
    if not text or not text.strip():
        return []

    text = text.strip()

    # If text fits in one chunk, return as-is
    if len(text) <= chunk_size:
        return [ChunkData(content=text, index=0)]

    separators = ["\n\n", "\n", ". ", " "]
    segments = _recursive_split(text, separators, chunk_size)

    # Merge segments into overlapping chunks
    chunks: list[ChunkData] = []
    current = ""
    idx = 0

    for segment in segments:
        if len(current) + len(segment) <= chunk_size:
            current += segment
        else:
            if current.strip():
                chunks.append(ChunkData(content=current.strip(), index=idx))
                idx += 1
                # Keep overlap from the end of current chunk
                overlap_text = current[-chunk_overlap:] if len(current) > chunk_overlap else current
                current = overlap_text + segment
            else:
                current = segment

    # Don't forget the last chunk
    if current.strip():
        chunks.append(ChunkData(content=current.strip(), index=idx))

    return chunks


def _recursive_split(text: str, separators: list[str], chunk_size: int) -> list[str]:
    """Recursively split text using progressively finer separators."""
    if not separators:
        # Last resort: hard split at chunk_size
        return [text[i:i + chunk_size] for i in range(0, len(text), chunk_size)]

    sep = separators[0]
    parts = text.split(sep)

    segments = []
    for i, part in enumerate(parts):
        # Re-attach the separator (except for the last part)
        segment = part + sep if i < len(parts) - 1 else part

        if len(segment) <= chunk_size:
            segments.append(segment)
        else:
            # This segment is too big — split with the next separator
            segments.extend(_recursive_split(segment, separators[1:], chunk_size))

    return segments
