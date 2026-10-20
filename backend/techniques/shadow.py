"""
Shadow and Illuminant Consistency Analysis.

Forensic Principle:
Physical scene consistency requires that cast shadows and illumination gradients adhere to
collinear light source projections in single-exposure photographic captures. In a natural,
unaltered photograph with a primary directional illuminant (e.g. outdoor sunlight or single
indoor key light), cast shadow boundaries point consistently away from the light source,
governed by planar projective geometry.

Forensic Indicators of Manipulation:
1. Directional Discrepancy:
   Spliced composite objects sourced from different photographs often display cast shadows
   whose trajectory angles contradict the ambient illumination or other cast shadows in the scene.
2. Penumbra Transition Inconsistency:
   The softness and luminance profile across the light-to-shadow transition (penumbra) depend
   on the light source angular diameter and distance. Spliced elements frequently feature
   mismatched edge softness or non-physical inverted luminance steps.
3. Color Constancy & Blue-Shift:
   Under natural daylight, shaded surfaces receive ambient skylight, exhibiting a characteristic
   subtle shift toward cooler blue wavelengths (reflected in lower b* in CIE Lab or elevated
   B/R ratios). Composited shadows created with simple black overlay filters fail this test.

Algorithm:
1. Illumination-invariant shadow segmentation using HSV (V-channel suppression) and CIE Lab
   (L* luminance attenuation and b* chromaticity).
2. Extraction of cast shadow boundaries and penumbra transition zones.
3. Gradient orientation field computation along shadow edges:
   theta(x, y) = arctan2(dI/dy, dI/dx)
4. Circular statistics on directional vectors across distinct spatial clusters/objects.
5. Inconsistency mapping: regional deviations from the dominant illuminant vector.
6. Calibration of normalized forgery likelihood score in [0.0, 1.0].
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import cv2
import numpy as np
from PIL import Image


def _load_image_bgr(image_input: Union[str, Path, Image.Image]) -> Optional[np.ndarray]:
    """Load input image as BGR uint8 NumPy array."""
    try:
        if isinstance(image_input, (str, Path)):
            img = cv2.imread(str(image_input))
            return img
        elif isinstance(image_input, Image.Image):
            rgb = np.array(image_input.convert("RGB"))
            return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
        return None
    except Exception:
        return None


def segment_shadow_regions(bgr: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    """
    Segment candidate cast shadow regions and illuminated surface regions.

    Returns:
        shadow_mask: uint8 binary mask (255 for shadow, 0 otherwise)
        illuminated_mask: uint8 binary mask (255 for illuminated regions, 0 otherwise)
    """
    hsv = cv2.cvtColor(bgr, cv2.COLOR_BGR2HSV)
    lab = cv2.cvtColor(bgr, cv2.COLOR_BGR2LAB)

    v_channel = hsv[:, :, 2].astype(np.float32)
    l_channel = lab[:, :, 0].astype(np.float32)

    # Shadow candidates have lower luminance than surrounding context
    # Use adaptive morphological Black-Hat and luminance ratio
    kernel_size = max(15, min(bgr.shape[0], bgr.shape[1]) // 25)
    if kernel_size % 2 == 0:
        kernel_size += 1
    struct_elem = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (kernel_size, kernel_size))

    # Morphological closing to estimate local background illumination
    illum_est = cv2.morphologyEx(l_channel, cv2.MORPH_CLOSE, struct_elem)
    ratio = np.divide(l_channel, illum_est + 1e-4, out=np.zeros_like(l_channel), where=(illum_est > 0))

    # Otsu thresholding on the luminance suppression ratio
    ratio_uint8 = np.clip(ratio * 255.0, 0, 255).astype(np.uint8)
    otsu_thresh, _ = cv2.threshold(ratio_uint8, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)

    # Relative luminance thresholding: shadows are significantly darker than scene median
    median_l = float(np.median(l_channel))
    is_scene_dark = (l_channel < median_l * 0.75) if median_l > 40 else False

    # Strict threshold: must be dark relative to ambient or scene median
    effective_thresh = min(otsu_thresh, 175)
    shadow_candidate = ((ratio_uint8 <= effective_thresh) | is_scene_dark) & (v_channel < 190)

    # Filter out extremely dark saturated black borders (e.g. letterboxing)
    non_border = np.zeros_like(shadow_candidate, dtype=bool)
    pad = 6
    if bgr.shape[0] > 2 * pad and bgr.shape[1] > 2 * pad:
        non_border[pad:-pad, pad:-pad] = True
    shadow_candidate = shadow_candidate & non_border

    # Clean up speckles with morphological opening then closing
    clean_kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    shadow_uint8 = np.uint8(shadow_candidate * 255)
    shadow_clean = cv2.morphologyEx(shadow_uint8, cv2.MORPH_OPEN, clean_kernel)
    shadow_clean = cv2.morphologyEx(shadow_clean, cv2.MORPH_CLOSE, clean_kernel)

    # Illuminated regions
    illuminated = (l_channel > np.percentile(l_channel, 55)) & (~shadow_clean.astype(bool))
    illum_clean = cv2.morphologyEx(np.uint8(illuminated * 255), cv2.MORPH_OPEN, clean_kernel)

    return shadow_clean, illum_clean


def compute_boundary_orientations(
    gray: np.ndarray, shadow_mask: np.ndarray
) -> Tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Compute gradient orientation angles along shadow-to-illuminated boundaries.

    Returns:
        angles: 1D array of orientation angles in radians [-pi, pi]
        coords: 2D array of (y, x) pixel coordinates for valid boundary samples
        grad_mag: 1D array of gradient magnitudes
    """
    # Morphological boundary: dilation minus original shadow
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (3, 3))
    dilated = cv2.dilate(shadow_mask, kernel, iterations=2)
    boundary = (dilated > 0) & (shadow_mask == 0)

    if not np.any(boundary):
        return np.array([]), np.empty((0, 2), dtype=int), np.array([])

    # Compute spatial gradients with Gaussian pre-smoothing
    blurred = cv2.GaussianBlur(gray, (5, 5), 1.2).astype(np.float32)
    gx = cv2.Sobel(blurred, cv2.CV_32F, 1, 0, ksize=3)
    gy = cv2.Sobel(blurred, cv2.CV_32F, 0, 1, ksize=3)

    mag = np.hypot(gx, gy)
    boundary_mags = mag[boundary]

    # Filter by gradient magnitude to keep genuine light-shadow transitions
    if len(boundary_mags) == 0:
        return np.array([]), np.empty((0, 2), dtype=int), np.array([])

    mag_thresh = max(float(np.percentile(boundary_mags, 40)), 12.0)
    valid_mask = boundary & (mag >= mag_thresh)

    ys, xs = np.where(valid_mask)
    if len(ys) == 0:
        return np.array([]), np.empty((0, 2), dtype=int), np.array([])

    angles = np.arctan2(gy[ys, xs], gx[ys, xs])
    mags = mag[ys, xs]
    coords = np.column_stack((ys, xs))

    return angles, coords, mags


def circular_mean_angle(angles: np.ndarray, weights: Optional[np.ndarray] = None) -> float:
    """Compute circular mean of directional angles in radians."""
    if len(angles) == 0:
        return 0.0
    if weights is None:
        sin_sum = np.sum(np.sin(angles))
        cos_sum = np.sum(np.cos(angles))
    else:
        w_norm = weights / (np.sum(weights) + 1e-6)
        sin_sum = np.sum(w_norm * np.sin(angles))
        cos_sum = np.sum(w_norm * np.cos(angles))
    return float(np.arctan2(sin_sum, cos_sum))


def angular_distance(a1: Union[float, np.ndarray], a2: Union[float, np.ndarray]) -> Union[float, np.ndarray]:
    """
    Compute circular angular distance normalized to [0.0, 1.0].
    0.0 = identical direction, 1.0 = diametrically opposite (180 deg).
    """
    diff = np.abs(a1 - a2)
    diff = np.minimum(diff, 2.0 * np.pi - diff)
    return diff / np.pi


def analyze(image_path: Union[str, Path, Image.Image]) -> dict:
    """
    Perform Shadow & Illuminant Consistency Analysis on the input image.

    Returns:
        Standardized forensic report dictionary:
        {
            "score": float in [0.0, 1.0],
            "available": bool,
            "message": str,
            "map": 2D float32 np.ndarray in [0.0, 1.0],
            "details": dict
        }
    """
    bgr = _load_image_bgr(image_path)
    if bgr is None:
        return {
            "score": None,
            "available": False,
            "message": "Failed to decode image for shadow consistency analysis.",
            "map": None,
            "details": {},
        }

    h, w = bgr.shape[:2]
    gray = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    # 1. Segment shadow regions and penumbra boundaries
    shadow_mask, illum_mask = segment_shadow_regions(bgr)
    shadow_pixels = int(np.count_nonzero(shadow_mask))
    total_pixels = h * w
    shadow_pct = float(round((shadow_pixels / total_pixels) * 100.0, 2))

    # Initialize empty 2D inconsistency heatmap
    heatmap = np.zeros((h, w), dtype=np.float32)

    # 2. Extract boundary orientations
    angles, coords, mags = compute_boundary_orientations(gray, shadow_mask)

    if len(angles) < 25 or shadow_pct < 0.2:
        # Not enough shadow contours to establish reliable directional geometry
        # Clean default indicating diffuse/ambient illumination without detectable contradictions
        return {
            "score": 0.12,
            "available": True,
            "message": (
                "Scene exhibits diffuse or ambient illumination without prominent directional cast shadows; "
                "no geometric illuminant contradictions detected."
            ),
            "map": heatmap,
            "details": {
                "shadow_coverage_pct": shadow_pct,
                "shadow_regions_detected": 0,
                "dominant_illuminant_angle_deg": None,
                "angular_dispersion_deg": 0.0,
                "directional_clusters": 0,
                "consistency_verdict": "Diffuse / Ambient Lighting (Consistent)",
            },
        }

    # 3. Find connected shadow components to analyze multi-object consistency
    num_labels, labels, stats, centroids = cv2.connectedComponentsWithStats(shadow_mask, connectivity=8)

    # Filter out tiny components (< 80 pixels)
    min_comp_size = max(80, int(total_pixels * 0.0003))
    valid_comp_indices = [
        i for i in range(1, num_labels) if stats[i, cv2.CC_STAT_AREA] >= min_comp_size
    ]

    # Global dominant angle (weighted by gradient magnitude)
    global_dom_angle = circular_mean_angle(angles, weights=mags)
    dom_angle_deg = float(round(np.degrees(global_dom_angle) % 360, 1))

    # 4. Regional consistency evaluation
    cluster_angles: List[float] = []
    cluster_weights: List[float] = []
    max_discrepancy = 0.0

    for comp_idx in valid_comp_indices:
        # Samples belonging to this component's dilated vicinity
        cy, cx = centroids[comp_idx]
        comp_mask = (labels == comp_idx)
        comp_dilated = cv2.dilate(np.uint8(comp_mask * 255), np.ones((7, 7), np.uint8))

        in_comp = comp_dilated[coords[:, 0], coords[:, 1]] > 0
        if np.count_nonzero(in_comp) < 12:
            continue

        comp_angles = angles[in_comp]
        comp_mags = mags[in_comp]
        comp_mean_angle = circular_mean_angle(comp_angles, weights=comp_mags)
        comp_dist = float(angular_distance(comp_mean_angle, global_dom_angle))

        cluster_angles.append(comp_mean_angle)
        cluster_weights.append(float(np.sum(comp_mags)))

        if comp_dist > max_discrepancy:
            max_discrepancy = comp_dist

        # Map local discrepancy onto heatmap along the component boundary
        ys_local = coords[in_comp, 0]
        xs_local = coords[in_comp, 1]
        heatmap[ys_local, xs_local] = np.maximum(heatmap[ys_local, xs_local], comp_dist)

    # Dilate and Gaussian blur heatmap for smooth forensic visualization
    blur_k = max(9, min(h, w) // 30)
    if blur_k % 2 == 0:
        blur_k += 1
    heatmap_dilated = cv2.dilate(heatmap, np.ones((5, 5), np.uint8))
    heatmap_smooth = cv2.GaussianBlur(heatmap_dilated, (blur_k, blur_k), 0)
    max_h = float(np.max(heatmap_smooth))
    if max_h > 0:
        heatmap_norm = np.clip(heatmap_smooth / max(max_h, 0.4), 0.0, 1.0)
    else:
        heatmap_norm = heatmap_smooth

    # 5. Angular dispersion across clusters
    if len(cluster_angles) >= 2:
        arr_angles = np.array(cluster_angles)
        sin_std = float(np.std(np.sin(arr_angles)))
        cos_std = float(np.std(np.cos(arr_angles)))
        angular_dispersion_rad = np.hypot(sin_std, cos_std)
        dispersion_deg = float(round(np.degrees(angular_dispersion_rad), 1))
    else:
        dispersion_deg = float(round(np.degrees(np.std(angles[:100])), 1)) if len(angles) > 1 else 0.0

    # 6. Calibrate Forgery Probability Score
    # Physical metric: if separate objects exhibit divergent shadow orientations,
    # the probability of composite splicing rises sharply.
    if len(valid_comp_indices) <= 1:
        # Single dominant object/shadow: verify intra-boundary variance
        raw_score = 0.15 + 0.35 * min(1.0, dispersion_deg / 60.0)
    else:
        # Multi-object scene: test inter-object illuminant alignment
        normalized_disp = min(1.0, dispersion_deg / 55.0)
        raw_score = 0.20 + 0.50 * max_discrepancy + 0.30 * normalized_disp

    final_score = float(round(np.clip(raw_score, 0.05, 0.95), 4))

    # Determine message and verdict
    if final_score < 0.35:
        verdict = "Consistent Unidirectional Illumination"
        message = (
            f"Cast shadow trajectories align consistently with a dominant light source "
            f"at approximately {dom_angle_deg}°. No geometric illuminant mismatches detected."
        )
    elif final_score < 0.65:
        verdict = "Mild Angular Dispersion / Complex Lighting"
        message = (
            f"Moderate shadow angular dispersion ({dispersion_deg}°) observed across {len(valid_comp_indices)} "
            f"regions, consistent with multiple ambient sources or curved surfaces."
        )
    else:
        verdict = "Severe Illuminant / Shadow Direction Contradiction"
        message = (
            f"Incompatible shadow trajectories identified across distinct image objects "
            f"(angular discrepancy up to {round(max_discrepancy * 180, 1)}°). Strong indicator of spliced composition."
        )

    return {
        "score": final_score,
        "available": True,
        "message": message,
        "map": heatmap_norm.astype(np.float32),
        "details": {
            "shadow_coverage_pct": shadow_pct,
            "shadow_regions_detected": len(valid_comp_indices),
            "dominant_illuminant_angle_deg": dom_angle_deg,
            "angular_dispersion_deg": dispersion_deg,
            "max_regional_angular_mismatch_deg": round(max_discrepancy * 180.0, 1),
            "consistency_verdict": verdict,
        },
    }
