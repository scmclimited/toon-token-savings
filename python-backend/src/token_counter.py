"""
token_counter.py
-----------------

Utilities for counting tokens and comparing the token footprint of JSON and TOON
representations.  Uses the `tiktoken` library to provide encoding models
compatible with OpenAI’s APIs.  Should `tiktoken` be unavailable, the module
falls back to a naive character count divided by four (a rough approximation of
tokens) and emits a warning.
"""

from __future__ import annotations

import warnings
from typing import Any, Dict, Tuple

try:
    import tiktoken
    _tiktoken_available = True
except Exception:
    _tiktoken_available = False

def _fallback_token_count(text: str) -> int:
    """Rough estimate of token count when `tiktoken` is unavailable.

    We assume one token is approximately four characters (English average).  This
    heuristic is coarse and should only be used when precise tokenisation is not
    possible.
    """
    # count grapheme clusters roughly; divide by 4 and round up
    return (len(text) + 3) // 4


def count_tokens(text: str, model: str = "cl100k_base") -> int:
    """Count tokens in a string using the specified encoding model.

    Parameters
    ----------
    text : str
        The input string to tokenise.
    model : str, optional
        The name of the encoding model to use.  Defaults to `cl100k_base`, which
        aligns with the default for GPT‑4‑series models.

    Returns
    -------
    int
        The number of tokens in the input string.
    """
    if not _tiktoken_available:
        warnings.warn("tiktoken is not installed; using fallback token count")
        return _fallback_token_count(text)
    # Some encodings can be loaded by name; for unknown names use encoding_for_model
    try:
        encoding = tiktoken.get_encoding(model)
    except Exception:
        encoding = tiktoken.encoding_for_model(model)
    return len(encoding.encode(text))


def compare_formats(data: Any, model: str = "cl100k_base") -> Dict[str, float]:
    """Compare token counts between JSON and TOON representations of `data`.

    Parameters
    ----------
    data : Any
        Python data structure (dict or list) that is serialisable to JSON.
    model : str, optional
        Encoding name to use for token counting.  Defaults to `cl100k_base`.

    Returns
    -------
    Dict[str, float]
        A dictionary with keys `json_tokens`, `toon_tokens` and `savings` (the
        relative reduction in tokens expressed as a percentage).  If TOON is not
        available, `toon_tokens` will equal `json_tokens` and `savings` will be 0.
    """
    from .dataset import to_json_string, to_toon  # local imports to avoid circular

    json_str = to_json_string(data)
    json_tokens = count_tokens(json_str, model)
    try:
        toon_str = to_toon(data)
        toon_tokens = count_tokens(toon_str, model)
    except Exception:
        toon_tokens = json_tokens
    # compute savings
    savings = 0.0
    if json_tokens > 0:
        savings = (json_tokens - toon_tokens) / json_tokens * 100.0
    return {
        'json_tokens': float(json_tokens),
        'toon_tokens': float(toon_tokens),
        'savings': float(savings),
    }


def normalise_usage(token_count: int, context_limit: int) -> float:
    """Normalise token usage to a fraction of the context window.

    Parameters
    ----------
    token_count : int
        Number of tokens consumed by the prompt.
    context_limit : int
        The maximum number of tokens the model can accept.

    Returns
    -------
    float
        A value between 0 and 1 representing the proportion of the context
        consumed.
    """
    if context_limit <= 0:
        raise ValueError("Context limit must be positive")
    return min(token_count / context_limit, 1.0)