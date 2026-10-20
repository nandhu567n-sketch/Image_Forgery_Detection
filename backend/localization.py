"""
Localization: turn a heatmap (from Grad-CAM, Copy-Move, Double Compression, ELA, or noise
analysis) into a highlighted version of the original image, so the
user can see *where* the forgery is, not just *that* it exists.
"""

from typing import Dict, Optional, Union
import cv2
import numpy as np
from PIL import Image


def heatmap_to_overlay(
    original: Image.Image, heatmap_2d: np.ndarray, alpha: float = 0.45
) -> Image.Image:
    """
    heatmap_2d: 2D array of values (roughly 0-1).
    Resized to match the original image and blended on top in a red/yellow "hot" color scheme.
    """
    orig_arr = np.array(original.convert("RGB"))
    h, w = orig_arr.shape[:2]

    heat = heatmap_2d.astype("float32")
    if heat.max() > 0:
        heat = heat / heat.max()
    heat_resized = cv2.resize(heat, (w, h))
    heat_uint8 = np.uint8(255 * heat_resized)
    heat_color = cv2.applyColorMap(heat_uint8, cv2.COLORMAP_JET)
    heat_color = cv2.cvtColor(heat_color, cv2.COLOR_BGR2RGB)

    overlay = (orig_arr * (1 - alpha) + heat_color * alpha).astype("uint8")
    return Image.fromarray(overlay)


def build_localization(
    original: Image.Image, technique_visuals: Dict[str, Optional[Union[np.ndarray, Image.Image]]]
) -> Image.Image:
    """
    Pick the best available heatmap to show.
    Priority: copy_move (if verified duplicate regions present),
    splicing (Grad-CAM), double_compression, noise map, then ELA map.
    """
    if (
        technique_visuals.get("copy_move") is not None
        and np.max(technique_visuals["copy_move"]) > 0
    ):
        return heatmap_to_overlay(original, technique_visuals["copy_move"])
    if technique_visuals.get("splicing") is not None:
        return heatmap_to_overlay(original, technique_visuals["splicing"])
    if technique_visuals.get("splicing_cnn") is not None:
        return heatmap_to_overlay(original, technique_visuals["splicing_cnn"])
    if technique_visuals.get("double_compression") is not None:
        return heatmap_to_overlay(original, technique_visuals["double_compression"])
    if technique_visuals.get("noise") is not None:
        return heatmap_to_overlay(original, technique_visuals["noise"])
    if technique_visuals.get("ela") is not None:
        ela_val = technique_visuals["ela"]
        if isinstance(ela_val, Image.Image):
            ela_val = np.array(ela_val.convert("L")).astype("float32")
        return heatmap_to_overlay(original, ela_val)
    return original
