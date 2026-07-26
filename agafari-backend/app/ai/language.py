"""Language detection for answer mirroring.

The model is Amharic-first and ignores a soft instruction to match the asker's
language, so the language is detected here and stated as a hard directive.
"""

ETHIOPIC_RANGES = ((0x1200, 0x137F), (0x1380, 0x139F), (0x2D80, 0x2DDF))

AMHARIC = "am"
ENGLISH = "en"


def detect_language(text: str) -> str:
    """Return 'am' when the text is predominantly Ethiopic script, else 'en'."""
    ethiopic = 0
    latin = 0
    for char in text:
        code = ord(char)
        if any(start <= code <= end for start, end in ETHIOPIC_RANGES):
            ethiopic += 1
        elif char.isalpha() and code < 0x250:
            latin += 1

    if ethiopic and ethiopic >= latin:
        return AMHARIC
    return ENGLISH


def language_directive(text: str) -> str:
    """A directive strong enough to override the model's default language."""
    if detect_language(text) == AMHARIC:
        return (
            "The question is written in Amharic. Write your entire answer in "
            "Amharic."
        )
    return (
        "The question is written in English. Write your entire answer in "
        "English only. Do not use Amharic script."
    )
