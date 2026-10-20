"""
Noise inconsistency analysis.

Idea: Every camera sensor leaves a faint, fairly consistent noise pattern
across a real photo. When a region is spliced from elsewhere, retouched, or edited,
its local noise characteristics typically differ from the rest of the image.

Approach: Extract a high-frequency noise residual (image minus a Gaussian-denoised
version of itself), partition into spatial blocks, and calculate the local noise
standard deviation across blocks.
- Real untouched photos exhibit relatively uniform noise statistics.
- Forged/spliced images exhibit elevated variation across blocks.
"""

from pathlib import Path
from typing import Union
import cv2
import numpy as np
from PIL import Image


def load_image(image_input: Union[str, Path, Image.Image]) -> Image.Image:
    """Helper to ensure an RGB PIL Image instance."""
    if isinstance(image_input, Image.Image):
        return image_input.convert("RGB")
    return Image.open(image_input).convert("RGB")


def noise_residual(img: Image.Image) -> np.ndarray:
    """Extract high-frequency noise residual using Gaussian denoising."""
    arr = np.array(img.convert("RGB")).astype("float32")
    denoised = cv2.GaussianBlur(arr, (5, 5), 0)
    residual = arr - denoised
    return residual


def block_noise_map(residual: np.ndarray, block_size: int = 16) -> np.ndarray:
    """Std-dev of the noise residual per block -> a coarse 2D noise map."""
    h, w, _ = residual.shape
    gray_res = residual.mean(axis=2)

    bh, bw = h // block_size, w // block_size
    if bh == 0 or bw == 0:
        return np.zeros((1, 1), dtype="float32")

    noise_map = np.zeros((bh, bw), dtype="float32")
    for i in range(bh):
        for j in range(bw):
            block = gray_res[
                i * block_size : (i + 1) * block_size,
                j * block_size : (j + 1) * block_size,
            ]
            noise_map[i, j] = block.std()

    return noise_map


def noise_score(img: Image.Image) -> float:
    """
    Compute a single 0-1 forgery risk score based on coefficient of variation (CV)
    of noise across spatial blocks.
    """
    residual = noise_residual(img)
    n_map = block_noise_map(residual)

    if n_map.size == 0 or n_map.mean() < 1e-6:
        return 0.0

    # Coefficient of variation across blocks: high = inconsistent noise
    cv_score = float(n_map.std() / (n_map.mean() + 1e-6))
    score = 1.0 / (1.0 + np.exp(-(cv_score - 1.2)))
    return float(np.clip(score, 0.0, 1.0))


def analyze(image_path: Union[str, Path, Image.Image]) -> dict:
    """
    Standard forensic analysis interface.
    Returns:
        score: float in [0.0, 1.0]
        available: bool
        message: human-readable forensic finding
        map: 2D ndarray representing local noise variation
        details: forensic metrics dictionary
    """
    try:
        img = load_image(image_path)
    except Exception as e:
        return {
            "score": None,
            "available": False,
            "message": f"Noise analysis unavailable: could not load image ({str(e)}).",
            "map": None,
            "details": {},
        }

    residual = noise_residual(img)
    n_map = block_noise_map(residual)

    mean_noise = float(n_map.mean()) if n_map.size > 0 else 0.0
    std_noise = float(n_map.std()) if n_map.size > 0 else 0.0
    cv_score = float(std_noise / (mean_noise + 1e-6))
    score = float(np.clip(1.0 / (1.0 + np.exp(-(cv_score - 1.2))), 0.0, 1.0))

    if score >= 0.5:
        msg = f"Elevated noise inconsistency detected across spatial blocks (CV: {cv_score:.3f})."
    else:
        msg = f"Noise residual distribution appears relatively homogeneous (CV: {cv_score:.3f})."

    # Normalize map to [0, 1] for visualization
    disp_map = n_map.copy()
    if disp_map.max() > disp_map.min():
        disp_map = (disp_map - disp_map.min()) / (disp_map.max() - disp_map.min())

    return {
        "score": score,
        "available": True,
        "message": msg,
        "map": disp_map,
        "details": {
            "mean_residual_std": round(mean_noise, 4),
            "noise_std_variation": round(std_noise, 4),
            "coefficient_of_variation": round(cv_score, 4),
            "block_grid_size": list(n_map.shape),
        },
    }


def run(img: Image.Image) -> dict:
    """Legacy backward-compatible interface."""
    residual = noise_residual(img)
    n_map = block_noise_map(residual)
    return {
        "technique": "noise",
        "score": noise_score(img),
        "visual": n_map,
    }
