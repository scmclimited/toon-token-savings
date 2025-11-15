"""
dataset.py
-------------

Utility functions for loading JSON data and converting it into TOON format.

The `toon-format` library exposes two main functions: `dump` and `dumps`, which
serialise Python objects into TOON strings.  Conversely, `load` and `loads`
parse TOON back into Python objects.  This module wraps those functions and
provides helpers for reading and writing files on disk.

If the `toon-format` package is not available at runtime, the module will raise
a RuntimeError when encoding or decoding is attempted.  Please install
`toon-format` via `pip install toon-format` before using these functions.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

try:
    from toon import dumps as toon_dumps, loads as toon_loads
except Exception:
    toon_dumps = None  # type: ignore
    toon_loads = None  # type: ignore

def load_data(file_path: str | Path) -> Any:
    """Load JSON data from a file.

    Parameters
    ----------
    file_path : str or Path
        The path to the JSON file.

    Returns
    -------
    Any
        The loaded Python object (usually list or dict).
    """
    path = Path(file_path)
    if not path.exists():
        raise FileNotFoundError(f"Dataset file not found: {file_path}")
    with path.open('r', encoding='utf-8') as f:
        return json.load(f)


def to_json_string(data: Any, indent: int | None = 2) -> str:
    """Serialise Python data into a JSON string.

    Parameters
    ----------
    data : Any
        Arbitrary JSON‑serialisable Python object.
    indent : int or None, optional
        Indentation for pretty printing; defaults to 2.

    Returns
    -------
    str
        A JSON formatted string.
    """
    return json.dumps(data, indent=indent, ensure_ascii=False)


def to_toon(data: Any) -> str:
    """Serialise Python data into a TOON string.

    Requires the `toon-format` library.  If the library is not installed,
    a RuntimeError is raised.

    Parameters
    ----------
    data : Any
        Arbitrary JSON‑serialisable Python object.

    Returns
    -------
    str
        A TOON formatted string.
    """
    if toon_dumps is None:
        raise RuntimeError(
            "The 'toon-format' package is required to encode data into TOON. "
            "Install it with `pip install toon-format`."
        )
    return toon_dumps(data)


def from_toon(toon_string: str) -> Any:
    """Parse a TOON string back into Python data.

    Parameters
    ----------
    toon_string : str
        The TOON formatted string to parse.

    Returns
    -------
    Any
        The resulting Python object.
    """
    if toon_loads is None:
        raise RuntimeError(
            "The 'toon-format' package is required to decode TOON. "
            "Install it with `pip install toon-format`."
        )
    return toon_loads(toon_string)


def save_to_file(content: str, path: str | Path) -> None:
    """Save a string to a file on disk.

    Parameters
    ----------
    content : str
        String to write to disk.
    path : str or Path
        Destination file path.
    """
    p = Path(path)
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('w', encoding='utf-8') as f:
        f.write(content)