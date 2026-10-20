"""
Copy-Move forgery detection module using keypoint matching and RANSAC verification.

Forensic principle:
Copy-move (cloning) forgery occurs when a region of an image is copied and pasted
into another location within the same image, typically to conceal an object or duplicate
evidence. The copied region may undergo geometric transformations (translation, rotation,
scaling) before placement.

Pipeline:
1. Grayscale conversion.
2. Keypoint extraction and descriptor computation via ORB (Oriented FAST and Rotated BRIEF).
3. Self-matching with Brute-Force Hamming matcher (BFMatcher), excluding trivial self-matches
   and close spatial neighbors (continuous textures).
4. Geometric consistency verification via RANSAC (Random Sample Consensus) estimating
   affine transformation between candidate duplicate pairs.
5. Generation of spatial localization duplicate region heatmap and region counting.
"""

from pathlib import Path
from typing import List, Optional, Tuple, Union
import cv2
import numpy as np
from PIL import Image


def load_image_cv(image_input: Union[str, Path, Image.Image]) -> Optional[np.ndarray]:
    """Load image as an RGB numpy array (uint8)."""
    if isinstance(image_input, Image.Image):
        return np.array(image_input.convert("RGB"))
    try:
        path_str = str(image_input)
        # Using cv2.imdecode to support paths with non-ascii characters on Windows
        with open(path_str, "rb") as f:
            bytes_data = np.frombuffer(f.read(), dtype=np.uint8)
            bgr = cv2.imdecode(bytes_data, cv2.IMREAD_COLOR)
            if bgr is None:
                return None
            return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    except Exception:
        return None


def generate_duplicate_map(
    shape: Tuple[int, int],
    inlier_pairs: List[Tuple[Tuple[float, float], Tuple[float, float]]],
    splat_radius: int = 20,
) -> np.ndarray:
    """
    Generate a 2D float32 [0, 1] localization map by splatting heat around
    all verified duplicate keypoint pairs.
    """
    h, w = shape
    dup_map = np.zeros((h, w), dtype=np.float32)

    if not inlier_pairs:
        return dup_map

    for pt1, pt2 in inlier_pairs:
        x1, y1 = int(round(pt1[0])), int(round(pt1[1]))
        x2, y2 = int(round(pt2[0])), int(round(pt2[1]))
        cv2.circle(dup_map, (x1, y1), splat_radius, 1.0, -1)
        cv2.circle(dup_map, (x2, y2), splat_radius, 1.0, -1)

    # Smooth the circles into continuous probability regions
    dup_map = cv2.GaussianBlur(dup_map, (21, 21), 0)
    if dup_map.max() > 0:
        dup_map = dup_map / dup_map.max()

    return dup_map.astype(np.float32)


def estimate_duplicate_regions(
    inlier_src_pts: np.ndarray, inlier_dst_pts: np.ndarray
) -> int:
    """
    Estimate number of distinct duplicate regions based on spatial separation.
    """
    if len(inlier_src_pts) < 4:
        return 0

    src_center = np.mean(inlier_src_pts, axis=0)
    dst_center = np.mean(inlier_dst_pts, axis=0)
    center_dist = float(np.linalg.norm(src_center - dst_center))

    # At least 2 regions (source and clone) if inliers are verified
    return 2 if center_dist > 20.0 else 1


def analyze(
    image_path: Union[str, Path, Image.Image],
    max_features: int = 2000,
    min_spatial_distance: float = 25.0,
    match_ratio: float = 0.78,
    ransac_threshold: float = 5.0,
) -> dict:
    """
    Standard forensic analysis interface for Copy-Move forgery.
    Returns:
        score: float in [0.0, 1.0]
        available: bool
        message: str describing finding
        map: 2D ndarray of shape (H, W) in [0.0, 1.0]
        details: dict of keypoints, inliers, and algorithm parameters
    """
    img_rgb = load_image_cv(image_path)
    if img_rgb is None:
        return {
            "score": None,
            "available": False,
            "message": "Copy-Move analysis unavailable: could not load image.",
            "map": None,
            "details": {},
        }

    h, w = img_rgb.shape[:2]
    gray = cv2.cvtColor(img_rgb, cv2.COLOR_RGB2GRAY)

    # 1. Feature extraction using ORB
    orb = cv2.ORB_create(
        nfeatures=max_features,
        scaleFactor=1.2,
        nlevels=8,
        edgeThreshold=15,
        firstLevel=0,
        WTA_K=2,
        scoreType=cv2.ORB_HARRIS_SCORE,
        patchSize=31,
    )
    keypoints, descriptors = orb.detectAndCompute(gray, None)

    if descriptors is None or len(keypoints) < 8:
        empty_map = np.zeros((h, w), dtype=np.float32)
        return {
            "score": 0.0,
            "available": True,
            "message": "Insufficient keypoints detected for copy-move analysis.",
            "map": empty_map,
            "details": {
                "algorithm": "ORB + BFMatcher + RANSAC",
                "keypoints_detected": len(keypoints) if keypoints else 0,
                "candidate_matches": 0,
                "ransac_inliers": 0,
                "region_count": 0,
            },
        }

    # 2. Self-matching with BFMatcher
    bf = cv2.BFMatcher(cv2.NORM_HAMMING, crossCheck=False)
    # Query up to 10 nearest neighbors for each descriptor
    knn_k = min(10, len(descriptors))
    matches = bf.knnMatch(descriptors, descriptors, k=knn_k)

    candidate_pairs: List[Tuple[int, int]] = []
    seen_pairs = set()

    for m_list in matches:
        if len(m_list) < 2:
            continue
        # Index 0 is the keypoint itself (dist=0). Inspect subsequent neighbors.
        valid_neighbors = []
        q_idx = m_list[0].queryIdx
        q_pt = keypoints[q_idx].pt

        for m in m_list[1:]:
            t_idx = m.trainIdx
            t_pt = keypoints[t_idx].pt
            spatial_dist = np.hypot(q_pt[0] - t_pt[0], q_pt[1] - t_pt[1])
            if spatial_dist >= min_spatial_distance:
                valid_neighbors.append(m)

        if len(valid_neighbors) >= 1:
            best_m = valid_neighbors[0]
            # Lowe's ratio test against next non-local neighbor if available, or distance check
            passed_test = False
            if len(valid_neighbors) >= 2:
                second_m = valid_neighbors[1]
                if best_m.distance < match_ratio * second_m.distance or best_m.distance <= 35:
                    passed_test = True
            else:
                if best_m.distance <= 40:
                    passed_test = True

            if passed_test:
                pair = (min(q_idx, best_m.trainIdx), max(q_idx, best_m.trainIdx))
                if pair not in seen_pairs:
                    seen_pairs.add(pair)
                    candidate_pairs.append(pair)

    # 3. Geometric verification using RANSAC
    inlier_pairs_pts: List[Tuple[Tuple[float, float], Tuple[float, float]]] = []
    inliers_count = 0

    if len(candidate_pairs) >= 4:
        src_pts = np.float32([keypoints[q].pt for q, t in candidate_pairs])
        dst_pts = np.float32([keypoints[t].pt for q, t in candidate_pairs])

        # Estimate 2D affine transformation (rotation, translation, scale) with RANSAC
        _, inlier_mask = cv2.estimateAffinePartial2D(
            src_pts,
            dst_pts,
            method=cv2.RANSAC,
            ransacReprojThreshold=ransac_threshold,
            maxIters=2000,
        )

        if inlier_mask is not None:
            inlier_indices = np.where(inlier_mask.ravel() == 1)[0]
            inliers_count = len(inlier_indices)
            for idx in inlier_indices:
                inlier_pairs_pts.append((tuple(src_pts[idx]), tuple(dst_pts[idx])))

    # 4. Generate map and count regions
    detection_map = generate_duplicate_map((h, w), inlier_pairs_pts)
    region_count = 0
    if inliers_count >= 4:
        src_inliers = np.float32([p[0] for p in inlier_pairs_pts])
        dst_inliers = np.float32([p[1] for p in inlier_pairs_pts])
        region_count = estimate_duplicate_regions(src_inliers, dst_inliers)

    # 5. Score computation
    if inliers_count == 0:
        score = 0.0
    elif inliers_count < 4:
        # Weak / unverified candidate matches
        score = float(round(min(0.20, inliers_count * 0.05), 4))
    else:
        # Verified affine geometric correspondence
        score = float(round(np.clip(0.35 + 0.65 * (1.0 - np.exp(-(inliers_count - 4) / 10.0)), 0.0, 1.0), 4))

    # 6. Forensic findings message
    if score >= 0.5:
        message = (
            f"Suspicious duplicate regions detected via keypoint matching "
            f"({inliers_count} verified inliers across {region_count} regions)."
        )
    elif 0.0 < score < 0.5:
        message = (
            f"Weak keypoint repetition detected ({inliers_count} inliers), "
            f"below confidence threshold for copy-move tampering."
        )
    else:
        message = "No copy-move duplicate regions detected."

    details = {
        "algorithm": "ORB + BFMatcher + RANSAC",
        "keypoints_detected": int(len(keypoints)),
        "candidate_matches": int(len(candidate_pairs)),
        "ransac_inliers": int(inliers_count),
        "region_count": int(region_count),
        "min_spatial_distance_px": float(min_spatial_distance),
        "inlier_coordinates_sample": [
            {"src": [round(p[0][0], 1), round(p[0][1], 1)], "dst": [round(p[1][0], 1), round(p[1][1], 1)]}
            for p in inlier_pairs_pts[:10]
        ],
    }

    return {
        "score": score,
        "available": True,
        "message": message,
        "map": detection_map,
        "details": details,
    }
