"""
Forensic Colormap & Visualization Utilities.

Provides consistent scientific colormapping (Turbo, Jet, Grayscale),
side-by-side colorbar generation, overlay blending, and keypoint
geometric cluster annotations for forensic evidence panels.
"""

import base64
import io
from typing import List, Optional, Tuple, Union
import cv2
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
from PIL import Image, ImageDraw


def decode_map_base64(map_b64: Optional[str]) -> Optional[np.ndarray]:
    """
    Decode a base64 grayscale PNG string into a 2D float32 array in [0.0, 1.0].
    """
    if not map_b64:
        return None
    try:
        raw_bytes = base64.b64decode(map_b64)
        pil_img = Image.open(io.BytesIO(raw_bytes)).convert("L")
        arr = np.array(pil_img, dtype=np.float32) / 255.0
        return arr
    except Exception:
        return None


def resize_map_to_image(map_2d: np.ndarray, target_size: Tuple[int, int]) -> np.ndarray:
    """
    Resize 2D map to target (width, height) using bilinear interpolation.
    """
    tw, th = target_size
    if (map_2d.shape[1], map_2d.shape[0]) == (tw, th):
        return map_2d
    return cv2.resize(map_2d, (tw, th), interpolation=cv2.INTER_LINEAR)


def render_colormap_image(
    map_2d: np.ndarray, colormap: str = "turbo"
) -> Image.Image:
    """
    Render 2D float array in [0, 1] into an RGB Image using a colormap.
    """
    norm = np.clip(map_2d, 0.0, 1.0)
    cmap = matplotlib.colormaps.get_cmap(colormap)
    rgba = cmap(norm)
    rgb = (rgba[:, :, :3] * 255.0).astype(np.uint8)
    return Image.fromarray(rgb)


def render_colormap_with_colorbar(
    map_2d: np.ndarray,
    colormap: str = "turbo",
    label_low: str = "Low",
    label_high: str = "High",
    title: str = "",
    figsize: Tuple[float, float] = (4.0, 4.0),
    dpi: int = 120,
) -> Image.Image:
    """
    Render a 2D map with an attached vertical colorbar labeled Low to High.
    Returns a crisp PIL Image.
    """
    norm = np.clip(map_2d, 0.0, 1.0)
    fig, ax = plt.subplots(figsize=figsize, dpi=dpi)
    im = ax.imshow(norm, cmap=colormap, vmin=0.0, vmax=1.0)
    ax.axis("off")

    cbar = fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)
    cbar.set_ticks([0.0, 0.5, 1.0])
    cbar.set_ticklabels([label_low, "Med", label_high])
    cbar.ax.tick_params(labelsize=8)
    if title:
        cbar.set_label(title, fontsize=8)

    plt.tight_layout()
    buf = io.BytesIO()
    plt.savefig(buf, format="png", bbox_inches="tight", pad_inches=0.03)
    plt.close(fig)
    buf.seek(0)
    return Image.open(buf)


def render_overlay(
    original_img: Image.Image,
    map_2d: np.ndarray,
    colormap: str = "jet",
    alpha: float = 0.45,
) -> Image.Image:
    """
    Blend colormapped heatmap over the original image with transparency.
    """
    w, h = original_img.size
    resized_map = resize_map_to_image(map_2d, (w, h))
    norm_map = np.clip(resized_map, 0.0, 1.0)

    orig_arr = np.array(original_img.convert("RGB")).astype(np.float32)
    heat_arr = np.uint8(255.0 * norm_map)

    cv_cmap = cv2.COLORMAP_JET if colormap == "jet" else cv2.COLORMAP_TURBO
    color_heat = cv2.applyColorMap(heat_arr, cv_cmap)
    color_heat = cv2.cvtColor(color_heat, cv2.COLOR_BGR2RGB).astype(np.float32)

    blended = (orig_arr * (1.0 - alpha) + color_heat * alpha).astype(np.uint8)
    return Image.fromarray(blended)


def render_copy_move_boxes(
    original_img: Image.Image,
    inliers_sample: List[dict],
    region_count: int = 0,
) -> Image.Image:
    """
    Annotate duplicate regions and vectors on the original image using
    detected RANSAC inlier coordinates.
    """
    annotated = original_img.copy()
    draw = ImageDraw.Draw(annotated)
    w, h = annotated.size

    if not inliers_sample or len(inliers_sample) == 0:
        return annotated

    src_points = []
    dst_points = []

    for pair in inliers_sample:
        src = pair.get("src")
        dst = pair.get("dst")
        if src and dst and len(src) == 2 and len(dst) == 2:
            sx, sy = float(src[0]), float(src[1])
            dx, dy = float(dst[0]), float(dst[1])
            src_points.append((sx, sy))
            dst_points.append((dx, dy))

            # Draw keypoint circles
            draw.ellipse([sx - 4, sy - 4, sx + 4, sy + 4], outline="#00ffcc", width=2)
            draw.ellipse([dx - 4, dy - 4, dx + 4, dy + 4], outline="#ff007f", width=2)
            # Connecting displacement vector
            draw.line([(sx, sy), (dx, dy)], fill="#ffff00", width=1)

    # Draw bounding boxes around spatial clusters if inliers exist
    if src_points:
        s_xs, s_ys = [p[0] for p in src_points], [p[1] for p in src_points]
        s_box = [
            max(0, min(s_xs) - 15),
            max(0, min(s_ys) - 15),
            min(w, max(s_xs) + 15),
            min(h, max(s_ys) + 15),
        ]
        draw.rectangle(s_box, outline="#00ffcc", width=3)

    if dst_points:
        d_xs, d_ys = [p[0] for p in dst_points], [p[1] for p in dst_points]
        d_box = [
            max(0, min(d_xs) - 15),
            max(0, min(d_ys) - 15),
            min(w, max(d_xs) + 15),
            min(h, max(d_ys) + 15),
        ]
        draw.rectangle(d_box, outline="#ff007f", width=3)

    return annotated
