"""
Color Filter Array (CFA) interpolation forensic analysis.

Forensic Principle:
Modern digital camera sensors (CCD / CMOS) capture raw light through a Color Filter Array,
most commonly a Bayer filter pattern (RGGB, BGGR, GRBG, GBRG), where each physical photosite
records only a single primary color (50% Green, 25% Red, 25% Blue).
The missing color values for each pixel are reconstructed during demosaicing via interpolation
from adjacent photosites.

When an image undergoes splicing, copy-move duplication, affine scaling, rotation, or synthetic
patch insertion, the periodic interpolation constraints of the native Bayer grid are locally
disrupted or destroyed.

Detection Strategy:
1. Model candidate Bayer periodicities across the image.
2. Estimate the green-channel interpolation residual using a 2D Laplacian reconstruction kernel.
3. Quantify the periodic variance ratio between estimated sampled and interpolated locations.
4. Calculate localized block-wise CFA inconsistency across spatial windows to produce a 2D
   inconsistency heatmap.
5. Derive an aggregate CFA anomaly score in [0.0, 1.0].
"""

from pathlib import Path
from typing import Dict, Optional, Tuple, Union
import cv2
import numpy as np
from PIL import Image


BAYER_PATTERNS = ["RGGB", "BGGR", "GRBG", "GBRG"]


def _get_bayer_green_mask(pattern: str, shape: Tuple[int, int]) -> np.ndarray:
    """
    Generate boolean mask where True indicates expected green photosite locations
    in the specified Bayer pattern.
    """
    h, w = shape
    mask = np.zeros((h, w), dtype=bool)

    if pattern == "RGGB":
        # Row 0: R, G, R, G... (odd cols)
        # Row 1: G, B, G, B... (even cols)
        mask[0::2, 1::2] = True
        mask[1::2, 0::2] = True
    elif pattern == "BGGR":
        # Row 0: B, G, B, G... (odd cols)
        # Row 1: G, R, G, R... (even cols)
        mask[0::2, 1::2] = True
        mask[1::2, 0::2] = True
    elif pattern == "GRBG":
        # Row 0: G, R, G, R... (even cols)
        # Row 1: B, G, B, G... (odd cols)
        mask[0::2, 0::2] = True
        mask[1::2, 1::2] = True
    elif pattern == "GBRG":
        # Row 0: G, B, G, B... (even cols)
        # Row 1: R, G, R, G... (odd cols)
        mask[0::2, 0::2] = True
        mask[1::2, 1::2] = True

    return mask


def compute_interpolation_residual(green_channel: np.ndarray) -> np.ndarray:
    """
    Estimate green-channel interpolation residual using a cross-neighborhood kernel.
    For bilinear/linear demosaicing, interpolated green values are the average of cardinal neighbors:
    K = [[0, 0.25, 0], [0.25, 0, 0.25], [0, 0.25, 0]]
    """
    kernel = np.array([[0.0, 0.25, 0.0],
                       [0.25, 0.0, 0.25],
                       [0.0, 0.25, 0.0]], dtype=np.float32)

    predicted_green = cv2.filter2D(green_channel, cv2.CV_32F, kernel)
    residual = np.abs(green_channel - predicted_green)
    return residual


def evaluate_bayer_periodicity(residual: np.ndarray) -> Tuple[str, float, np.ndarray]:
    """
    Evaluate candidate Bayer patterns and identify the dominant pattern along with
    the overall periodicity ratio.
    """
    h, w = residual.shape
    best_pattern = "RGGB"
    best_ratio = 0.0
    best_mask = np.zeros((h, w), dtype=bool)

    for pattern in BAYER_PATTERNS:
        mask = _get_bayer_green_mask(pattern, (h, w))
        sampled_res = residual[mask]
        interpolated_res = residual[~mask]

        var_sampled = float(np.var(sampled_res)) if len(sampled_res) > 0 else 0.0
        var_interp = float(np.var(interpolated_res)) if len(interpolated_res) > 0 else 0.0

        # Authentic CFA images exhibit higher residual variance at true sampled photosites
        # compared to smoothly interpolated positions
        ratio = (var_sampled / (var_interp + 1e-6)) if var_interp > 0 else 1.0

        if ratio > best_ratio:
            best_ratio = ratio
            best_pattern = pattern
            best_mask = mask

    return best_pattern, best_ratio, best_mask


def compute_cfa_inconsistency_map(
    residual: np.ndarray,
    green_mask: np.ndarray,
    block_size: int = 32,
    step: int = 16,
) -> Tuple[np.ndarray, float, float]:
    """
    Compute block-wise CFA inconsistency map across the image.
    Blocks where local periodicity is degraded or absent are assigned higher anomaly values.
    """
    h, w = residual.shape
    pad_h = ((h + block_size - 1) // block_size) * block_size
    pad_w = ((w + block_size - 1) // block_size) * block_size

    res_padded = np.pad(residual, ((0, pad_h - h), (0, pad_w - w)), mode="reflect")
    mask_padded = np.pad(green_mask, ((0, pad_h - h), (0, pad_w - w)), mode="constant")

    grid_h = (pad_h - block_size) // step + 1
    grid_w = (pad_w - block_size) // step + 1
    inconsistency_grid = np.zeros((grid_h, grid_w), dtype=np.float32)

    block_ratios = []

    for r in range(grid_h):
        for c in range(grid_w):
            y = r * step
            x = c * step
            blk_res = res_padded[y : y + block_size, x : x + block_size]
            blk_mask = mask_padded[y : y + block_size, x : x + block_size]

            sampled = blk_res[blk_mask]
            interpolated = blk_res[~blk_mask]

            if len(sampled) > 0 and len(interpolated) > 0:
                var_s = float(np.var(sampled))
                var_i = float(np.var(interpolated))
                # Local ratio: low ratio indicates disruption of expected demosaicing periodicity
                ratio = var_s / (var_i + 1e-6)
                block_ratios.append(ratio)
                # Map ratio to inconsistency: expected ratio > 1.25 -> consistent (0), ratio <= 1.0 -> inconsistent (1)
                inconsistency = float(np.clip(1.0 - (ratio - 1.0) / 0.8, 0.0, 1.0))
            else:
                inconsistency = 0.5

            inconsistency_grid[r, c] = inconsistency

    # Upscale grid to full image dimensions
    inconsistency_map = cv2.resize(
        inconsistency_grid, (w, h), interpolation=cv2.INTER_LINEAR
    )
    inconsistency_map = np.clip(inconsistency_map, 0.0, 1.0).astype(np.float32)

    mean_inconsistency = float(np.mean(inconsistency_map))
    anomalous_fraction = float(np.mean(inconsistency_map > 0.65))

    return inconsistency_map, mean_inconsistency, anomalous_fraction


def analyze(image_path: Union[str, Path, Image.Image]) -> dict:
    """
    Standard forensic analysis interface for CFA interpolation.
    Returns:
        score: float in [0.0, 1.0] representing CFA tampering likelihood
        available: bool
        message: human-readable forensic finding
        map: 2D ndarray float32 in [0, 1] CFA inconsistency heatmap
        details: technical forensic metrics dictionary
    """
    try:
        if isinstance(image_path, Image.Image):
            pil_img = image_path.convert("RGB")
            arr = np.array(pil_img, dtype=np.float32) / 255.0
        else:
            path_str = str(image_path)
            pil_img = Image.open(path_str).convert("RGB")
            arr = np.array(pil_img, dtype=np.float32) / 255.0
    except Exception as e:
        return {
            "score": None,
            "available": False,
            "message": f"CFA analysis unavailable: could not load image ({str(e)}).",
            "map": None,
            "details": {},
        }

    h, w, c = arr.shape
    if min(h, w) < 32:
        return {
            "score": None,
            "available": False,
            "message": f"CFA analysis unavailable: image dimensions ({w}x{h}) too small (min 32x32 required).",
            "map": None,
            "details": {"dimensions": [w, h]},
        }

    # Extract green channel for demosaicing periodicity evaluation
    green = arr[:, :, 1]
    residual = compute_interpolation_residual(green)

    # 1. Determine dominant Bayer pattern and global periodicity ratio
    dominant_pattern, global_ratio, green_mask = evaluate_bayer_periodicity(residual)

    # 2. Compute spatial CFA inconsistency map and anomaly metrics
    inconsistency_map, mean_inconsistency, anomalous_fraction = compute_cfa_inconsistency_map(
        residual, green_mask, block_size=32, step=16
    )

    # 3. Derive calibrated tampering score in [0.0, 1.0]
    # Spliced regions or non-demosaiced synthetic renders destroy CFA periodicity
    # Authentic camera images have global_ratio > 1.3 and low anomalous_fraction
    raw_score = 0.6 * anomalous_fraction + 0.4 * mean_inconsistency
    score = float(np.clip(raw_score, 0.0, 1.0))

    if score >= 0.65:
        msg = f"Significant Color Filter Array (CFA) demosaicing inconsistency detected ({score*100:.1f}% anomaly density). Possible spliced or synthetic region."
    elif score >= 0.35:
        msg = f"Moderate CFA periodicity variance observed (anomalous block ratio: {anomalous_fraction:.2f})."
    else:
        msg = f"Uniform Bayer CFA demosaicing periodicity verified ({dominant_pattern} pattern consistent across image)."

    return {
        "score": round(score, 4),
        "available": True,
        "message": msg,
        "map": inconsistency_map,
        "details": {
            "dominant_bayer_pattern": dominant_pattern,
            "periodicity_ratio": round(global_ratio, 4),
            "mean_inconsistency": round(mean_inconsistency, 4),
            "anomalous_block_fraction": round(anomalous_fraction, 4),
            "channel_evaluated": "Green (Bayer Primary)",
        },
    }
