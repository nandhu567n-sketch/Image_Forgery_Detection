"""
FastAPI backend.

Run with:
    uvicorn backend.main:app --reload

Then POST an image to http://127.0.0.1:8000/detect
"""

import io
import os
from pathlib import Path
import tempfile
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from backend.pipeline import run_pipeline

app = FastAPI(
    title="AI-Driven Multi-Technique Image Forensic Analysis and Forgery Detection Framework",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_FILE_SIZE_MB = 10
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/jpg"}


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/detect")
@app.post("/analyze")
async def detect(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_CONTENT_TYPES:
        raise HTTPException(status_code=400, detail="Only JPEG/PNG images are accepted.")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE_MB * 1024 * 1024:
        raise HTTPException(
            status_code=400, detail=f"File too large (max {MAX_FILE_SIZE_MB}MB)."
        )

    # Preserve file extension to retain metadata and format properties
    orig_ext = Path(file.filename or "").suffix.lower()
    if orig_ext not in [".jpg", ".jpeg", ".png"]:
        orig_ext = ".jpg" if "jpeg" in file.content_type else ".png"

    with tempfile.NamedTemporaryFile(suffix=orig_ext, delete=False) as tmp:
        tmp.write(contents)
        tmp_path = tmp.name

    try:
        # Validate that the file is readable as an image
        with Image.open(tmp_path) as im:
            im.verify()

        result = run_pipeline(tmp_path)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=400, detail=f"Could not process image file: {str(e)}"
        )
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass
