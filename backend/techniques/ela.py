"""
Error Level Analysis (ELA).

Idea: Re-save the image at a known JPEG quality, then compare it to the
original pixel-by-pixel. Untouched regions compress fairly evenly.
Edited regions (pasted-in, retouched, spliced) often show a different,
uneven error pattern because they were compressed a different number of
times before being combined into this image.

Returns:
    score   -> float 0-1, higher means more likely forged
    map     -> 2D float32 array normalized to [0, 1] for localization
    details -> dictionary of compression error statistics
"""

import io
from pathlib import Path
from typing import Union
import numpy as np
from PIL import Image, ImageChops


def load_image(image_input: Union[str, Path, Image.Image]) -> Image.Image:
    """Helper to ensure an RGB PIL Image instance."""
    if isinstance(image_input, Image.Image):
        return image_input.convert("RGB")
    return Image.open(image_input).convert("RGB")


def compute_ela(img: Image.Image, quality: int = 90, amplify: int = 20):
    # Re-save at a known quality in memory (no disk write needed)
    buffer = io.BytesIO()
    img.convert("RGB").save(buffer, "JPEG", quality=quality)
    buffer.seek(0)
    resaved = Image.open(buffer)

    diff = ImageChops.difference(img.convert("RGB"), resaved)
    diff_arr = np.array(diff).astype("float32")

    # Amplify so differences are visible / usable as a score
    amplified = np.clip(diff_arr * amplify, 0, 255).astype("uint8")
    ela_map = Image.fromarray(amplified)

    return diff_arr, ela_map


def ela_score(img: Image.Image) -> float:
    """
    Turn the raw difference map into a single 0-1 forgery score.
    Approach: look at how *uneven* the error is across the image.
    A real, untouched photo tends to have fairly uniform compression noise.
    A forged image tends to have patches of much higher error than the rest.
    """
    diff_arr, _ = compute_ela(img)
    gray = diff_arr.mean(axis=2)  # average over R,G,B

    mean_err = gray.mean()
    std_err = gray.std()
    if mean_err < 1e-6:
        return 0.0

    unevenness = std_err / (mean_err + 1e-6)

    # Squash into 0-1 with a simple, tunable curve.
    score = 1.0 / (1.0 + np.exp(-(unevenness - 1.5)))
    return float(np.clip(score, 0.0, 1.0))


def analyze(image_path: Union[str, Path, Image.Image]) -> dict:
    """
    Standard forensic analysis interface.
    Returns:
        score: float in [0.0, 1.0]
        available: bool
        message: human-readable forensic finding
        map: 2D ndarray normalized to [0, 1]
        details: forensic metrics dictionary
    """
    try:
        img = load_image(image_path)
    except Exception as e:
        return {
            "score": None,
            "available": False,
            "message": f"ELA unavailable: could not load image ({str(e)}).",
            "map": None,
            "details": {},
        }

    diff_arr, ela_map = compute_ela(img)
    score = ela_score(img)
    gray = diff_arr.mean(axis=2)
    mean_err = float(gray.mean())
    std_err = float(gray.std())
    unevenness = float(std_err / (mean_err + 1e-6))

    if score >= 0.5:
        msg = f"Elevated compression error inconsistency detected across regions (unevenness: {unevenness:.3f})."
    else:
        msg = f"Compression error level appears relatively uniform across regions (unevenness: {unevenness:.3f})."

    # Map normalized to [0, 1]
    map_norm = gray.astype("float32")
    if map_norm.max() > map_norm.min():
        map_norm = (map_norm - map_norm.min()) / (map_norm.max() - map_norm.min())

    return {
        "score": score,
        "available": True,
        "message": msg,
        "map": map_norm,
        "details": {
            "mean_error": round(mean_err, 4),
            "std_error": round(std_err, 4),
            "unevenness_ratio": round(unevenness, 4),
            "resave_quality": 90,
        },
    }


def run(img: Image.Image) -> dict:
    """Legacy backward-compatible interface."""
    diff_arr, ela_map = compute_ela(img)
    return {
        "technique": "ela",
        "score": ela_score(img),
        "visual": ela_map,  # PIL Image, usable for localization/report
    }
