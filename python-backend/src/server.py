"""
server.py
---------

A simple API server built with FastAPI that exposes endpoints to encode JSON data
into TOON, decode TOON back to Python objects, compare token counts, and upload
files.  The server is designed to be consumed by the React front‑end but can
also be used independently.
"""

from __future__ import annotations

import base64
import io
from pathlib import Path
from typing import Any, Dict

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from .dataset import load_data, to_toon, from_toon, to_json_string
from .token_counter import compare_formats

app = FastAPI(title="TOON Token Savings API", description="Encode, decode and compare token counts")

# Configure CORS so that the React front‑end can call this API from
# localhost. In production you can restrict the origins to your deployed
# domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class DataInput(BaseModel):
    data: Any


class ToonInput(BaseModel):
    toon: str


@app.post("/encode")
async def encode_data(input_data: DataInput) -> Dict[str, Any]:
    """Encode arbitrary JSON data into a TOON string."""
    try:
        toon_str = to_toon(input_data.data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"toon": toon_str}


@app.post("/decode")
async def decode_toon(toon_input: ToonInput) -> Dict[str, Any]:
    """Decode a TOON string into Python data."""
    try:
        data = from_toon(toon_input.toon)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"data": data}


@app.post("/compare")
async def compare(input_data: DataInput) -> Dict[str, float]:
    """Compare token counts between JSON and TOON representations of the data."""
    result = compare_formats(input_data.data)
    return result


@app.post("/upload")
async def upload(file: UploadFile = File(...)) -> Dict[str, Any]:
    """Upload a JSON file and return its TOON encoding and token comparison."""
    if not file.filename.lower().endswith(".json"):
        raise HTTPException(status_code=400, detail="Only JSON files are supported")
    contents = await file.read()
    try:
        import json
        data = json.loads(contents)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON file")
    
    # Try to encode to TOON, but handle gracefully if encoder is not implemented
    toon_str = None
    toon_error = None
    try:
        toon_str = to_toon(data)
    except RuntimeError as e:
        # Store the error message but don't fail the entire request
        # This allows users to still see JSON token counts
        toon_error = str(e)
    except Exception as e:
        # For other errors, still store but don't fail
        toon_error = f"Error encoding to TOON: {str(e)}"
    
    # Get token comparison (this will still work even if TOON encoding failed)
    result = compare_formats(data)
    
    # If TOON encoding failed, set toon_tokens to None or same as JSON
    if toon_str is None and toon_error:
        # Adjust comparison to show only JSON tokens
        result['toon_tokens'] = result.get('json_tokens', 0)
        result['savings'] = 0.0
    
    return {
        "toon": toon_str,
        "toon_error": toon_error,  # Include error message for frontend display
        "comparison": result,
        "original_json": json.dumps(data, indent=2),  # Include original JSON for decoder button
    }