"""
Forensic Evidence Panels for Streamlit Dashboard.

Renders 11 numbered forensic evidence panels in a 2-column layout matching
academic forensic reporting standards. Every visual is derived from genuine
computed module outputs or the user's uploaded image.
"""

from typing import Any, Dict, List, Optional, Tuple, Union
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from PIL import Image
import streamlit as st

from ui.colormaps import (
    decode_map_base64,
    render_colormap_with_colorbar,
    render_copy_move_boxes,
    render_overlay,
)

# Shared forensic score threshold configuration
STATUS_CONFIG = {
    "high": {"min": 0.65, "label": "High", "color": "#d9534f", "bg": "#fdf2f2"},
    "moderate": {"min": 0.35, "label": "Moderate", "color": "#f0ad4e", "bg": "#fef9f0"},
    "low": {"min": 0.0, "label": "Low", "color": "#5cb85c", "bg": "#f2faf2"},
    "unavailable": {"label": "Unavailable", "color": "#6c757d", "bg": "#f8f9fa"},
}


def get_status_info(score: Optional[float], available: bool) -> Tuple[str, str, str]:
    """Return (label, text_color, bg_color) based on unified forensic thresholds."""
    if not available or score is None:
        cfg = STATUS_CONFIG["unavailable"]
        return cfg["label"], cfg["color"], cfg["bg"]
    if score >= STATUS_CONFIG["high"]["min"]:
        cfg = STATUS_CONFIG["high"]
        return cfg["label"], cfg["color"], cfg["bg"]
    if score >= STATUS_CONFIG["moderate"]["min"]:
        cfg = STATUS_CONFIG["moderate"]
        return cfg["label"], cfg["color"], cfg["bg"]
    cfg = STATUS_CONFIG["low"]
    return cfg["label"], cfg["color"], cfg["bg"]


@st.cache_data(show_spinner=False)
def get_cached_colorbar_map(
    map_b64: str, colormap: str = "turbo", label_low: str = "Low", label_high: str = "High", title: str = ""
) -> Optional[Image.Image]:
    """Cache rendered colorbar figure from base64 map string."""
    arr = decode_map_base64(map_b64)
    if arr is None:
        return None
    return render_colormap_with_colorbar(
        arr, colormap=colormap, label_low=label_low, label_high=label_high, title=title
    )


@st.cache_data(show_spinner=False)
def get_cached_overlay(
    original_img: Image.Image, map_b64: str, colormap: str = "jet", alpha: float = 0.45
) -> Optional[Image.Image]:
    """Cache blended overlay image from base64 map string."""
    arr = decode_map_base64(map_b64)
    if arr is None:
        return None
    return render_overlay(original_img, arr, colormap=colormap, alpha=alpha)


def render_panel(
    title: str,
    desc: str,
    example: str,
    images: List[Image.Image],
    captions: List[str],
    score: Optional[float],
    status: str,
    status_color: str,
    status_bg: str,
    message: str = "",
    details: Optional[Dict[str, Any]] = None,
    extra_content_fn: Optional[Any] = None,
):
    """
    Standard panel renderer.
    Renders header pill, description, example line, image comparison columns,
    and optional forensic metrics expander.
    """
    with st.container(border=True):
        # Header with colored title, score, and status pill
        header_cols = st.columns([3, 1, 1.2])
        with header_cols[0]:
            st.markdown(
                f"<h4 style='margin:0; padding:0; color:#1e293b;'>{title}</h4>",
                unsafe_allow_html=True,
            )
        with header_cols[1]:
            if score is not None:
                st.markdown(
                    f"<div style='text-align:right; font-weight:600; color:#475569; padding-top:4px;'>Score: {score:.4f}</div>",
                    unsafe_allow_html=True,
                )
            else:
                st.markdown(
                    "<div style='text-align:right; color:#94a3b8; padding-top:4px;'>Score: —</div>",
                    unsafe_allow_html=True,
                )
        with header_cols[2]:
            st.markdown(
                f"<div style='background-color:{status_bg}; color:{status_color}; border:1px solid {status_color}; "
                f"border-radius:12px; font-size:12px; font-weight:700; text-align:center; padding:2px 8px;'>"
                f"{status}</div>",
                unsafe_allow_html=True,
            )

        st.caption(f"**Methodology:** {desc}")
        st.markdown(
            f"<div style='font-size:11px; color:#64748b; margin-bottom:8px;'>💡 <i>{example}</i></div>",
            unsafe_allow_html=True,
        )

        # Unavailable case: clean informative notice, no placeholder images
        if status == "Unavailable" or not images:
            st.info(f"ℹ️ **Status: Unavailable** — {message}")
            return

        # Render custom widget or side-by-side images
        if extra_content_fn:
            extra_content_fn()

        if images:
            cols = st.columns(len(images))
            for idx, col in enumerate(cols):
                with col:
                    st.image(images[idx], use_container_width=True)
                    if idx < len(captions):
                        st.caption(captions[idx])

        # Forensic details expander
        if details:
            with st.expander("🔎 View Technical Forensic Details", expanded=False):
                clean_details = {k: v for k, v in details.items() if k not in ["all_tags"]}
                st.json(clean_details)


# ==============================================================================
# 11 SPECIFIC PANEL RENDERERS (REFERENCE ORDER)
# ==============================================================================

def render_copy_move_panel(report: dict, base_img: Image.Image, key_prefix: str = "cm"):
    """Panel 1: Copy-Move Detection."""
    title = "1 COPY-MOVE DETECTION"
    desc = "Detects duplicate cloned patches within the image using keypoint feature matching (ORB + RANSAC)."
    example = "Example: An object duplicated or cloned to cover up an area or duplicate evidence."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "")
    details = report.get("details", {})
    status, color, bg = get_status_info(score, available)

    if not available:
        render_panel(title, desc, example, [], [], score, status, color, bg, message)
        return

    map_b64 = report.get("map_base64")
    overlay_toggle = st.checkbox(
        "Overlay Density Heatmap on Input",
        key=f"{key_prefix}_overlay",
        help="Blend keypoint spatial density over the input image.",
    )

    inliers_sample = details.get("inlier_coordinates_sample", [])
    region_count = details.get("region_count", 0)

    # Left: Matched regions annotated on input image
    left_img = render_copy_move_boxes(base_img, inliers_sample, region_count=region_count)

    # Right: Heatmap or blended overlay
    if overlay_toggle and map_b64:
        right_img = get_cached_overlay(base_img, map_b64, colormap="jet", alpha=0.45) or base_img
        right_caption = "Overlay: Inlier density blended on input image."
    elif map_b64:
        right_img = get_cached_colorbar_map(map_b64, colormap="turbo", title="Density") or base_img
        right_caption = "Detection Heatmap: Warmer colors indicate higher duplicate keypoint density."
    else:
        right_img = base_img
        right_caption = "No duplicate density map generated."

    captions = [
        f"Input Image (Matched keypoints: {details.get('ransac_inliers', 0)} inliers, {region_count} regions boxed).",
        right_caption,
    ]
    render_panel(
        title, desc, example, [left_img, right_img], captions, score, status, color, bg, message, details
    )


def render_splicing_panel(report: dict, base_img: Image.Image, key_prefix: str = "sp"):
    """Panel 2: Splicing Detection (CNN)."""
    title = "2 SPLICING DETECTION (CNN)"
    desc = "Identifies foreign spliced elements using a deep convolutional neural network (MobileNetV2 Transfer Learning)."
    example = "Example: An object or person copied from an external photo and inserted into this scene."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "")
    details = report.get("details", {})
    status, color, bg = get_status_info(score, available)

    if not available:
        render_panel(title, desc, example, [], [], score, status, color, bg, message)
        return

    map_b64 = report.get("map_base64")
    overlay_toggle = st.checkbox(
        "Show Full-Resolution Feature Activation Overlay",
        key=f"{key_prefix}_overlay",
        value=True,
        help="Blend CNN spatial feature activations directly over the uploaded image.",
    )

    left_img = base_img
    if overlay_toggle and map_b64:
        right_img = get_cached_overlay(base_img, map_b64, colormap="jet", alpha=0.45) or base_img
        right_caption = "Splicing Overlay: Red/yellow regions mark strongest neural splicing activations."
    elif map_b64:
        right_img = get_cached_colorbar_map(map_b64, colormap="jet", title="Splicing") or base_img
        right_caption = "CNN Feature Map: Spatial probability distribution across feature grid."
    else:
        right_img = base_img
        right_caption = "No feature map available."

    captions = ["Input Image (Uploaded).", right_caption]
    render_panel(
        title, desc, example, [left_img, right_img], captions, score, status, color, bg, message, details
    )


def render_double_compression_panel(report: dict, base_img: Image.Image, key_prefix: str = "dc"):
    """Panel 3: Double JPEG Compression."""
    title = "3 DOUBLE JPEG COMPRESSION"
    desc = "Analyzes 8×8 block DCT coefficient histograms for periodic double-quantization (DQ) artifacts."
    example = "Example: An image saved, edited in another program, and saved again at a different quality."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "")
    details = report.get("details", {})
    status, color, bg = get_status_info(score, available)

    if not available:
        render_panel(title, desc, example, [], [], score, status, color, bg, message)
        return

    map_b64 = report.get("map_base64")
    overlay_toggle = st.checkbox(
        "Overlay DCT Reconstruction Inconsistency on Image",
        key=f"{key_prefix}_overlay",
    )

    left_img = base_img
    if overlay_toggle and map_b64:
        right_img = get_cached_overlay(base_img, map_b64, colormap="turbo", alpha=0.45) or base_img
        right_caption = "DCT Overlay: Highlighting spatial blocks with inconsistent compression."
    elif map_b64:
        right_img = get_cached_colorbar_map(map_b64, colormap="turbo", title="DCT Err") or base_img
        right_caption = "DCT Inconsistency Map: Warmer colors indicate blocks with elevated residual error."
    else:
        right_img = base_img
        right_caption = "No DCT map available."

    captions = [
        f"Input Image (Estimated JPEG Q: {details.get('estimated_quality', 'Unknown')}).",
        right_caption,
    ]
    render_panel(
        title, desc, example, [left_img, right_img], captions, score, status, color, bg, message, details
    )


def render_metadata_panel(report: dict, base_img: Image.Image):
    """Panel 4: Metadata (EXIF) Integrity."""
    title = "4 METADATA & EXIF INTEGRITY"
    desc = "Inspects embedded camera EXIF tags for editing software signatures and provenance anomalies."
    example = "Example: Software tags from Adobe Photoshop or mismatches between file timestamps and capture date."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "")
    details = report.get("details", {})
    status, color, bg = get_status_info(score, available)

    if not available:
        render_panel(title, desc, example, [], [], score, status, color, bg, message)
        return

    def metadata_table_view():
        anomalies = details.get("anomalies_detected", [])
        if anomalies:
            st.error(f"⚠️ **Metadata Anomaly Detected:** {'; '.join(anomalies)}")
        else:
            st.success("✅ **No Metadata Anomaly Found:** Consistent with original camera hardware capture.")

        dims = details.get("actual_dimensions", ["—", "—"])
        exif_dims = details.get("exif_dimensions") or ["—", "—"]

        table_data = [
            {"Field": "Camera Make", "Extracted Value": details.get("make") or "Not recorded", "Flag": "—"},
            {"Field": "Camera Model", "Extracted Value": details.get("model") or "Not recorded", "Flag": "—"},
            {
                "Field": "Software Tag",
                "Extracted Value": details.get("software") or "None (Clean)",
                "Flag": "⚠️ Editing Software" if any("software" in a for a in anomalies) else "Normal",
            },
            {
                "Field": "Capture Time (DateTimeOriginal)",
                "Extracted Value": details.get("datetime_original") or "Not recorded",
                "Flag": "—",
            },
            {
                "Field": "Modify Time (DateTime)",
                "Extracted Value": details.get("datetime_modified") or "Not recorded",
                "Flag": "⚠️ Timestamp Shift" if any("timestamp" in a for a in anomalies) else "Normal",
            },
            {
                "Field": "Pixel Dimensions",
                "Extracted Value": f"{dims[0]} × {dims[1]} (Actual) vs {exif_dims[0]} × {exif_dims[1]} (EXIF)",
                "Flag": "⚠️ Dimension Mismatch" if any("dimension" in a for a in anomalies) else "Matching",
            },
        ]
        df = pd.DataFrame(table_data)
        st.dataframe(df, use_container_width=True, hide_index=True)

    render_panel(
        title,
        desc,
        example,
        [],
        [],
        score,
        status,
        color,
        bg,
        message,
        details,
        extra_content_fn=metadata_table_view,
    )


def render_noise_panel(report: dict, base_img: Image.Image, key_prefix: str = "noise"):
    """Panel 5: Noise Residual Analysis."""
    title = "5 NOISE RESIDUAL INCONSISTENCY"
    desc = "Extracts high-frequency sensor noise residuals to evaluate variance across spatial blocks."
    example = "Example: A spliced object having smoother or noisier sensor grain than the surrounding background."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "")
    details = report.get("details", {})
    status, color, bg = get_status_info(score, available)

    if not available:
        render_panel(title, desc, example, [], [], score, status, color, bg, message)
        return

    map_b64 = report.get("map_base64")
    overlay_toggle = st.checkbox(
        "Overlay Noise Inconsistency on Input",
        key=f"{key_prefix}_overlay",
    )

    left_img = base_img
    if overlay_toggle and map_b64:
        right_img = get_cached_overlay(base_img, map_b64, colormap="turbo", alpha=0.45) or base_img
        right_caption = "Noise Overlay: Spatial blocks with abnormal noise variance highlighted."
    elif map_b64:
        right_img = get_cached_colorbar_map(map_b64, colormap="turbo", title="Noise Std") or base_img
        right_caption = "Block Noise Map: Standard deviation of high-frequency noise residual per 16×16 block."
    else:
        right_img = base_img
        right_caption = "No noise map available."

    cv_val = details.get("coefficient_of_variation", 0.0)
    captions = [f"Input Image (Global Noise CV: {cv_val:.3f}).", right_caption]
    render_panel(
        title, desc, example, [left_img, right_img], captions, score, status, color, bg, message, details
    )


def render_cfa_panel(report: dict, base_img: Image.Image):
    """Panel 6: Color Filter Array (CFA)."""
    title = "6 COLOR FILTER ARRAY (CFA)"
    desc = "Examines local demosaicing interpolation periodicity and color channel correlation."
    example = "Example: Tampered regions disrupting the periodic Bayer pattern interpolation footprint."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "Phase 2 technique: Color Filter Array (CFA) interpolation analysis not yet implemented.")
    status, color, bg = get_status_info(score, available)

    render_panel(title, desc, example, [], [], score, status, color, bg, message)


def render_ela_panel(report: dict, base_img: Image.Image, key_prefix: str = "ela"):
    """Panel 7: Error Level Analysis (ELA)."""
    title = "7 ERROR LEVEL ANALYSIS (ELA)"
    desc = "Re-compresses the image at 90% JPEG quality to measure pixel-level compression error rate variations."
    example = "Example: Recently inserted uncompressed graphics exhibiting higher error rates than older compressed background."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "")
    details = report.get("details", {})
    status, color, bg = get_status_info(score, available)

    if not available:
        render_panel(title, desc, example, [], [], score, status, color, bg, message)
        return

    map_b64 = report.get("map_base64")
    overlay_toggle = st.checkbox(
        "Overlay ELA Inconsistency on Input",
        key=f"{key_prefix}_overlay",
    )

    left_img = base_img
    if overlay_toggle and map_b64:
        right_img = get_cached_overlay(base_img, map_b64, colormap="jet", alpha=0.45) or base_img
        right_caption = "ELA Overlay: Blended compression error variation over input image."
    elif map_b64:
        right_img = get_cached_colorbar_map(map_b64, colormap="turbo", title="ELA Error") or base_img
        right_caption = "ELA Difference Map: Brighter areas indicate regions with differing compression history."
    else:
        right_img = base_img
        right_caption = "No ELA difference map available."

    unevenness = details.get("unevenness_ratio", 0.0)
    captions = [f"Input Image (Error Unevenness Ratio: {unevenness:.3f}).", right_caption]
    render_panel(
        title, desc, example, [left_img, right_img], captions, score, status, color, bg, message, details
    )


def render_prnu_panel(report: dict, base_img: Image.Image):
    """Panel 8: Sensor Pattern Noise (PRNU)."""
    title = "8 SENSOR NOISE FINGERPRINT (PRNU)"
    desc = "Correlates high-frequency photo-response non-uniformity sensor noise against camera fingerprints."
    example = "Example: Validating whether all scene regions share identical sensor silicon imperfections."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "Phase 2 technique: PRNU camera sensor fingerprint analysis not yet implemented.")
    status, color, bg = get_status_info(score, available)

    render_panel(title, desc, example, [], [], score, status, color, bg, message)


def render_shadow_panel(report: dict, base_img: Image.Image):
    """Panel 9: Shadow Consistency Analysis."""
    title = "9 SHADOW & LIGHTING CONSISTENCY"
    desc = "Estimates illumination vector directions and shadow casting angles across segmented objects."
    example = "Example: Two objects in the same outdoor scene casting shadows in conflicting directions."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "Phase 3 technique: Shadow consistency analysis not yet implemented.")
    status, color, bg = get_status_info(score, available)

    render_panel(title, desc, example, [], [], score, status, color, bg, message)


def render_xai_panel(report: dict, base_img: Image.Image, key_prefix: str = "xai"):
    """Panel 10: Explainable AI (Grad-CAM XAI)."""
    title = "10 EXPLAINABLE AI (GRAD-CAM)"
    desc = "Visualizes gradient-weighted class activation mapping targeting MobileNetV2's final convolutional layer."
    example = "Example: Pinpointing exactly which spatial visual features drove the neural classifier's decision."

    # XAI utilizes splicing CNN activations
    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "")
    details = report.get("details", {})
    status, color, bg = get_status_info(score, available)

    if not available:
        render_panel(title, desc, example, [], [], score, status, color, bg, message)
        return

    map_b64 = report.get("map_base64")
    overlay_toggle = st.checkbox(
        "Show Grad-CAM Class Activation Overlay",
        key=f"{key_prefix}_overlay",
        value=True,
    )

    left_img = base_img
    if overlay_toggle and map_b64:
        right_img = get_cached_overlay(base_img, map_b64, colormap="jet", alpha=0.50) or base_img
        right_caption = "Grad-CAM Overlay: Warm highlights show critical visual evidence regions."
    elif map_b64:
        right_img = get_cached_colorbar_map(map_b64, colormap="jet", title="Importance") or base_img
        right_caption = "Grad-CAM Activation Map: Normalized neural importance distribution."
    else:
        right_img = base_img
        right_caption = "No Grad-CAM activation map available."

    captions = ["Input Image (Uploaded).", right_caption]
    render_panel(
        title, desc, example, [left_img, right_img], captions, score, status, color, bg, message, details
    )


def render_adversarial_panel(report: dict, base_img: Image.Image):
    """Panel 11: Adversarial Robustness."""
    title = "11 ADVERSARIAL ATTACK ROBUSTNESS"
    desc = "Evaluates prediction stability under post-processing perturbations (JPEG compression, Gaussian noise, blur, scaling)."
    example = "Example: Subtle high-frequency adversarial noise fooling deep learning classifiers into false classifications."

    score = report.get("score")
    available = report.get("available", False)
    message = report.get("message", "Phase 3 technique: Adversarial attack robustness analysis not yet implemented.")
    status, color, bg = get_status_info(score, available)

    render_panel(title, desc, example, [], [], score, status, color, bg, message)


# ==============================================================================
# CONTRIBUTION BAR CHART & SUMMARY BAR
# ==============================================================================

def render_contribution_bar_chart(contributions: Dict[str, float]):
    """
    Render horizontal contribution bar chart with explicit sign explanation.
    '+ pushes toward forged, - pushes toward authentic'.
    """
    st.subheader("Technique Influence on Final Decision")
    st.caption("Sign convention: **(+) pushes toward forged**, **(−) pushes toward authentic**.")

    if not contributions:
        st.info("No technique contribution weights available.")
        return

    names = list(contributions.keys())
    values = [float(contributions[k]) for k in names]

    # Prettier display labels
    pretty_names = [n.replace("_", " ").title() for n in names]

    fig, ax = plt.subplots(figsize=(7, max(2.5, len(names) * 0.55)), dpi=120)
    colors = ["#d9534f" if v >= 0 else "#5cb85c" for v in values]

    y_pos = np.arange(len(names))
    bars = ax.barh(y_pos, values, color=colors, height=0.55, edgecolor="none")

    ax.axvline(0, color="#64748b", linewidth=1.2, linestyle="--")
    ax.set_yticks(y_pos)
    ax.set_yticklabels(pretty_names, fontsize=10, fontweight="bold")
    ax.set_xlabel("Contribution Weight (Log-Odds Impact)", fontsize=9, color="#475569")
    ax.spines["top"].set_visible(False)
    ax.spines["right"].set_visible(False)
    ax.spines["left"].set_color("#cbd5e1")
    ax.spines["bottom"].set_color("#cbd5e1")
    ax.grid(axis="x", linestyle=":", alpha=0.6)

    # Annotate numeric values on bars
    for bar in bars:
        w = bar.get_width()
        x_pos = w + (0.04 if w >= 0 else -0.04)
        ha = "left" if w >= 0 else "right"
        ax.text(
            x_pos,
            bar.get_y() + bar.get_height() / 2,
            f"{w:+.2f}",
            va="center",
            ha=ha,
            fontsize=9,
            fontweight="bold",
            color="#1e293b",
        )

    plt.tight_layout()
    st.pyplot(fig)
    plt.close(fig)


def render_summary_bar(scores: Dict[str, Optional[float]], reports: Dict[str, dict]):
    """
    Generate a dynamic summary bar with one sentence derived strictly from real results.
    """
    evaluated_count = sum(1 for k, r in reports.items() if r.get("available"))
    total_count = len(reports)

    high_flagged = [k for k, s in scores.items() if s is not None and s >= STATUS_CONFIG["high"]["min"]]
    mod_flagged = [
        k
        for k, s in scores.items()
        if s is not None and STATUS_CONFIG["moderate"]["min"] <= s < STATUS_CONFIG["high"]["min"]
    ]
    low_flagged = [k for k, s in scores.items() if s is not None and s < STATUS_CONFIG["moderate"]["min"]]
    unavailable = [k for k, r in reports.items() if not r.get("available")]

    flagged_total = len(high_flagged) + len(mod_flagged)
    flagged_names = [f"{k.replace('_', ' ').title()}" for k in (high_flagged + mod_flagged)]
    flagged_str = ", ".join(flagged_names) if flagged_names else "none"

    summary_text = (
        f"**Forensic Summary:** Evaluated **{evaluated_count} of {total_count}** forensic techniques. "
        f"**{flagged_total} signal(s) flagged suspicious artifacts** ({flagged_str}), "
        f"**{len(low_flagged)} signal(s)** observed low/natural variation, and "
        f"**{len(unavailable)} technique(s)** were unavailable for this image file format or scheduled for upcoming phases."
    )

    st.markdown(
        f"<div style='background-color:#f1f5f9; border-left: 5px solid #0284c7; padding: 12px 16px; "
        f"border-radius: 4px; font-size: 14px; color: #0f172a; margin-top: 20px; margin-bottom: 25px;'>"
        f"{summary_text}</div>",
        unsafe_allow_html=True,
    )
