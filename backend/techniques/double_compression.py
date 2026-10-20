"""
Double JPEG Compression detection module.

Forensic principle:
When an image is compressed as JPEG, its 8x8 spatial blocks undergo 2D Discrete Cosine
Transform (DCT), and the resulting coefficients are divided by a quantization matrix Q
and rounded to integers.
If the image is subsequently decompressed, edited (or unmodified), and re-compressed
with a second quantization matrix Q2:
- If Q1 != Q2, the rounding operation c2 = round(c1 * Q1 / Q2) produces a non-monotonic,
  comb-like periodic artifact in the histogram of DCT coefficients (Double Quantization / DQ effect).
- In the frequency domain of the histogram, this periodicity manifests as distinct spectral peaks.
- In spatially localized forgeries (splicing or copy-move), the copied patch often carries
  a different compression history or misaligned 8x8 block grid, generating local DCT
  inconsistencies in the block reconstruction residual.

Constraints:
- JPEG only. For non-JPEG formats (PNG, BMP, TIFF), returns available=False with score=None.
- Never fabricates a score when format or data is unavailable.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import cv2
import numpy as np
from PIL import Image

# Standard JPEG baseline luminance quantization matrix (Quality 50)
STANDARD_LUMA_Q50 = np.array(
    [
        [16, 11, 10, 16, 24, 40, 51, 61],
        [12, 12, 14, 19, 26, 58, 60, 55],
        [14, 13, 16, 24, 40, 57, 69, 56],
        [14, 17, 22, 29, 51, 87, 80, 62],
        [18, 22, 37, 56, 68, 109, 103, 77],
        [24, 35, 55, 64, 81, 104, 113, 92],
        [49, 64, 78, 87, 103, 121, 120, 101],
        [72, 92, 95, 98, 112, 100, 103, 99],
    ],
    dtype=np.float32,
)

# Selected low-to-mid frequency AC modes for histogram DQ analysis
PRIMARY_AC_MODES = [
    (0, 1),
    (1, 0),
    (1, 1),
    (2, 0),
    (0, 2),
    (2, 1),
    (1, 2),
    (3, 0),
    (0, 3),
]


def is_jpeg_format(image_input: Union[str, Path, Image.Image]) -> Tuple[bool, Optional[Image.Image]]:
    """
    Verify whether the input is a genuine JPEG image via file header and PIL format.
    """
    if isinstance(image_input, Image.Image):
        # Check format attribute
        fmt = getattr(image_input, "format", None)
        if fmt == "JPEG":
            return True, image_input
        # If format is None, check filename or magic bytes if available
        fn = getattr(image_input, "filename", None)
        if fn and Path(fn).suffix.lower() in [".jpg", ".jpeg", ".jpe"]:
            return True, image_input
        return False, None

    path = Path(image_input)
    if not path.is_file():
        return False, None

    # Check extension and magic bytes (0xFF, 0xD8, 0xFF)
    try:
        with open(path, "rb") as f:
            header = f.read(3)
            if header != b"\xff\xd8\xff":
                return False, None
        img = Image.open(path)
        if img.format == "JPEG":
            return True, img
        return False, None
    except Exception:
        return False, None


def estimate_jpeg_quality(q_table: np.ndarray) -> int:
    """Estimate standard JPEG quality factor from the luminance quantization table."""
    try:
        ratio = float(np.mean(q_table[:3, :3]) / np.mean(STANDARD_LUMA_Q50[:3, :3]))
        if ratio <= 0:
            return 100
        if ratio < 1.0:
            quality = int(round(100.0 - ratio * 50.0))
        else:
            quality = int(round(5000.0 / (ratio * 100.0)))
        return int(np.clip(quality, 1, 100))
    except Exception:
        return 75


def analyze_dq_periodicity(hist: np.ndarray) -> float:
    """
    Measure periodic double-quantization artifact strength in a coefficient histogram.
    Returns a peak-to-average spectral ratio.
    """
    if np.sum(hist) < 50:
        return 0.0

    # Detrend by subtracting moving-average smooth envelope
    k = np.array([1, 2, 3, 2, 1], dtype=np.float32) / 9.0
    smooth = np.convolve(hist.astype(np.float32), k, mode="same")
    residual = hist.astype(np.float32) - smooth

    # FFT of high-frequency fluctuation in the histogram
    fft_spec = np.abs(np.fft.rfft(residual))
    if len(fft_spec) <= 3:
        return 0.0

    # AC frequency components (excluding DC and lowest fundamental)
    ac = fft_spec[2:]
    mean_ac = float(np.mean(ac))
    if mean_ac < 1e-5:
        return 0.0

    peak_ratio = float(np.max(ac) / (mean_ac + 1e-6))
    return peak_ratio


def analyze(image_path: Union[str, Path, Image.Image]) -> dict:
    """
    Standard forensic analysis interface for Double JPEG Compression.
    Returns:
        score: float in [0.0, 1.0] or None if unavailable (e.g. non-JPEG format)
        available: bool
        message: str describing forensic finding
        map: 2D ndarray of shape (H, W) or block grid in [0.0, 1.0]
        details: dict of quantization metrics, periodicity ratios, and quality estimates
    """
    opened_img = None
    if isinstance(image_path, Image.Image):
        fmt = getattr(image_path, "format", None)
        fn = getattr(image_path, "filename", None)
        if fmt != "JPEG" and not (fn and Path(fn).suffix.lower() in [".jpg", ".jpeg", ".jpe"]):
            return {
                "score": None,
                "available": False,
                "message": "JPEG compression analysis unavailable for this image format.",
                "map": None,
                "details": {},
            }
        pil_img = image_path
    else:
        path = Path(image_path)
        if not path.is_file():
            return {
                "score": None,
                "available": False,
                "message": "JPEG compression analysis unavailable for this image format.",
                "map": None,
                "details": {},
            }
        try:
            with open(path, "rb") as f:
                header = f.read(3)
                if header != b"\xff\xd8\xff":
                    return {
                        "score": None,
                        "available": False,
                        "message": "JPEG compression analysis unavailable for this image format.",
                        "map": None,
                        "details": {},
                    }
            opened_img = Image.open(path)
            if opened_img.format != "JPEG":
                opened_img.close()
                return {
                    "score": None,
                    "available": False,
                    "message": "JPEG compression analysis unavailable for this image format.",
                    "map": None,
                    "details": {},
                }
            pil_img = opened_img
        except Exception:
            return {
                "score": None,
                "available": False,
                "message": "JPEG compression analysis unavailable for this image format.",
                "map": None,
                "details": {},
            }

    try:
        # Extract Luminance Y channel
        y_channel = np.array(pil_img.convert("YCbCr"))[:, :, 0].astype(np.float32)
        h, w = y_channel.shape
        bh, bw = h // 8, w // 8

        if bh < 2 or bw < 2:
            return {
                "score": 0.0,
                "available": True,
                "message": "Image resolution too small for 8x8 block DCT analysis.",
                "map": np.zeros((h, w), dtype=np.float32),
                "details": {"grid_dimensions": [bh, bw]},
            }

        # Retrieve or approximate quantization table
        if hasattr(pil_img, "quantization") and pil_img.quantization and 0 in pil_img.quantization:
            q_table = np.array(pil_img.quantization[0], dtype=np.float32).reshape((8, 8))
        else:
            q_table = STANDARD_LUMA_Q50.copy()

        estimated_quality = estimate_jpeg_quality(q_table)

        # 1. Block-wise 8x8 DCT and reconstruction residual map
        dct_blocks = np.zeros((bh, bw, 8, 8), dtype=np.float32)
        grid_err = np.zeros((bh, bw), dtype=np.float32)

        for i in range(bh):
            for j in range(bw):
                blk = y_channel[i * 8 : (i + 1) * 8, j * 8 : (j + 1) * 8] - 128.0
                d = cv2.dct(blk)
                dct_blocks[i, j] = d
                # Quantization rounding error
                reconstructed = np.round(d / q_table) * q_table
                grid_err[i, j] = np.mean(np.abs(d - reconstructed))

        # 2. Histogram periodicity analysis across primary AC modes
        mode_ratios: List[float] = []
        for u, v in PRIMARY_AC_MODES:
            q_val = max(1.0, float(q_table[u, v]))
            coeffs = dct_blocks[:, :, u, v].ravel()
            quantized_coeffs = np.round(coeffs / q_val).astype(int)

            # Restrict to standard dynamic range
            valid = quantized_coeffs[np.abs(quantized_coeffs) <= 30]
            if len(valid) >= 50:
                hist, _ = np.histogram(valid, bins=np.arange(-30.5, 31.5))
                ratio = analyze_dq_periodicity(hist)
                if ratio > 0.0:
                    mode_ratios.append(ratio)

        avg_periodicity = float(np.mean(mode_ratios)) if mode_ratios else 0.0

        # 3. Spatial detection map (interpolated to original resolution)
        map_resized = cv2.resize(grid_err, (w, h), interpolation=cv2.INTER_LINEAR)
        if map_resized.max() > map_resized.min():
            norm_map = (map_resized - map_resized.min()) / (map_resized.max() - map_resized.min())
        else:
            norm_map = np.zeros((h, w), dtype=np.float32)

        # 4. Score calibration:
        # Single JPEG usually has periodicity ratio in ~1.5 - 2.8.
        # Strong double compression with mismatched Q factors pushes ratio > 3.2.
        # Local grid variation (CV of grid error) also contributes if localized tampering occurred.
        err_mean = float(grid_err.mean())
        err_std = float(grid_err.std())
        err_cv = float(err_std / (err_mean + 1e-6))

        # Logistic calibration over periodicity and spatial inconsistency
        z = (avg_periodicity - 3.2) * 1.5 + (err_cv - 0.20) * 4.0
        score = float(np.clip(1.0 / (1.0 + np.exp(-z)), 0.0, 1.0))
        score = round(score, 4)

        if score >= 0.5:
            message = (
                f"Double JPEG compression artifacts detected in DCT coefficient distributions "
                f"(DQ periodicity ratio: {avg_periodicity:.2f}, estimated Q: {estimated_quality})."
            )
        else:
            message = (
                f"Single JPEG compression characteristics observed; no prominent double quantization artifacts "
                f"(DQ periodicity ratio: {avg_periodicity:.2f}, estimated Q: {estimated_quality})."
            )

        details = {
            "format": "JPEG",
            "estimated_quality": estimated_quality,
            "quantization_table_sample": [int(x) for x in q_table.ravel()[:8]],
            "modes_analyzed": len(mode_ratios),
            "mean_periodicity_ratio": round(avg_periodicity, 3),
            "reconstruction_error_mean": round(err_mean, 4),
            "reconstruction_error_std": round(err_std, 4),
            "reconstruction_error_cv": round(err_cv, 4),
            "block_grid_dimensions": [int(bh), int(bw)],
        }

        return {
            "score": score,
            "available": True,
            "message": message,
            "map": norm_map.astype(np.float32),
            "details": details,
        }

    except Exception as e:
        return {
            "score": None,
            "available": False,
            "message": f"Double compression analysis failed: {str(e)}",
            "map": None,
            "details": {},
        }
    finally:
        if opened_img is not None:
            opened_img.close()
