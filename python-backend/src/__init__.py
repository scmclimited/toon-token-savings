"""
TOON Token Savings Demo - Source Package

This package provides utilities for encoding/decoding TOON format,
counting tokens, and comparing JSON vs TOON token usage.
"""

__version__ = "0.1.0"

def run_server():
    """Entry point for running the FastAPI server."""
    import uvicorn
    uvicorn.run("src.server:app", host="0.0.0.0", port=8000, reload=True)

