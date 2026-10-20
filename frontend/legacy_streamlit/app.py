"""
AI-Driven Framework for Multi-Technique Image Forgery Detection.
Streamlit Forensic Analysis Dashboard.

Renders an 11-panel evidence dashboard in a 2-column grid layout, displaying
computed forensic maps, keypoint matches, EXIF provenance tables, and
explainable fusion contributions. Every visual is derived strictly from real
computed outputs.
"""

import io
import os
import sys
from pathlib import Path
import requests
import streamlit as st
from PIL import Image

# Ensure local UI modules are discoverable
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
if str(CURRENT_DIR) not in sys.path:
    sys.path.append(str(CURRENT_DIR))
if str(ROOT_DIR) not in sys.path:
    sys.path.append(str(ROOT_DIR))

from ui.panels import (
    render_adversarial_panel,
    render_cfa_panel,
    render_contribution_bar_chart,
    render_copy_move_panel,
    render_double_compression_panel,
    render_ela_panel,
    render_metadata_panel,
    render_noise_panel,
    render_prnu_panel,
    render_shadow_panel,
    render_splicing_panel,
    render_summary_bar,
    render_xai_panel,
)

API_URL = "http://127.0.0.1:8000/detect"

st.set_page_config(
    page_title="AI-Driven Multi-Technique Forensic Dashboard",
    page_icon="🛡️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom styling for high-contrast forensic cards
st.markdown(
    """
    <style>
    .main-header {
        font-size: 26px;
        font-weight: 800;
        color: #0f172a;
        margin-bottom: 2px;
    }
    .sub-header {
        font-size: 13px;
        color: #475569;
        margin-bottom: 18px;
    }
    .verdict-card {
        padding: 16px 20px;
        border-radius: 8px;
        margin-bottom: 16px;
    }
    .disclaimer-card {
        background-color: #f8fafc;
        border-left: 4px solid #64748b;
        padding: 10px 14px;
        font-size: 12px;
        color: #334155;
        margin-bottom: 20px;
        border-radius: 2px;
    }
    </style>
    """,
    unsafe_allow_html=True,
)


def normalize_display_image(img: Image.Image, max_dim: int = 512) -> Image.Image:
    """Normalize image to standard display thumbnail preserving aspect ratio."""
    display_copy = img.copy().convert("RGB")
    display_copy.thumbnail((max_dim, max_dim))
    return display_copy


# ==============================================================================
# SIDEBAR CONTROLS
# ==============================================================================
with st.sidebar:
    st.markdown("### 🛡️ Digital Forensic Engine")
    st.caption("AI-Driven Multi-Technique Framework")
    st.markdown("---")

    uploaded_file = st.file_uploader(
        "Upload Investigation Image",
        type=["jpg", "jpeg", "png"],
        help="Upload image in JPEG or PNG format (max 10MB).",
    )

    if uploaded_file is not None:
        try:
            raw_img = Image.open(io.BytesIO(uploaded_file.getvalue()))
            disp_preview = normalize_display_image(raw_img, max_dim=256)
            st.image(disp_preview, caption=f"File: {uploaded_file.name}", use_container_width=True)
            st.caption(f"Original Resolution: {raw_img.size[0]} × {raw_img.size[1]} px")
        except Exception:
            st.error("Invalid image format.")

    analyze_btn = st.button("🚀 Run Forensic Analysis", type="primary", use_container_width=True)

    st.markdown("---")
    st.markdown("#### System Architecture")
    st.markdown(
        """
        - **Phase 1 Active Modules:**
          - Copy-Move (ORB + RANSAC)
          - Splicing CNN (MobileNetV2)
          - Double Compression (8×8 DCT)
          - Metadata Provenance (EXIF)
          - Noise Residual (Gaussian)
          - Error Level Analysis (ELA)
          - Explainable AI (Grad-CAM)
        - **Phase 2–3 Modules (Upcoming):**
          - CFA Demosaicing Inconsistency
          - PRNU Sensor Noise Fingerprint
          - Shadow & Illumination Vectors
          - Adversarial Perturbation Stability
        """
    )


# ==============================================================================
# MAIN DASHBOARD AREA
# ==============================================================================
st.markdown("<div class='main-header'>AI-Driven Framework for Multi-Technique Image Forgery Detection</div>", unsafe_allow_html=True)
st.markdown(
    "<div class='sub-header'>Comprehensive forensic investigation across deep convolutional features, "
    "discrete cosine transform domain, keypoint duplication, and sensor noise characteristics.</div>",
    unsafe_allow_html=True,
)

# Manage state so user interaction with panel widgets doesn't wipe output
if "analysis_result" not in st.session_state:
    st.session_state.analysis_result = None
if "cached_display_img" not in st.session_state:
    st.session_state.cached_display_img = None

if analyze_btn and uploaded_file is not None:
    with st.spinner("Executing multi-technique forensic pipeline across 11 signal slots..."):
        file_bytes = uploaded_file.getvalue()
        files = {"file": (uploaded_file.name, file_bytes, uploaded_file.type)}
        try:
            response = requests.post(API_URL, files=files, timeout=90)
        except requests.exceptions.ConnectionError:
            st.error(
                "❌ Could not connect to FastAPI backend at `http://127.0.0.1:8000`. "
                "Ensure server is active via: `python -m uvicorn backend.main:app --port 8000`"
            )
            st.stop()

        if response.status_code != 200:
            try:
                err_detail = response.json().get("detail", response.text)
            except Exception:
                err_detail = response.text or f"HTTP error {response.status_code}"
            st.error(f"Detection pipeline failed: {err_detail}")
            st.stop()
        else:
            st.session_state.analysis_result = response.json()
            raw_pil = Image.open(io.BytesIO(file_bytes)).convert("RGB")
            st.session_state.cached_display_img = normalize_display_image(raw_pil, max_dim=512)

result = st.session_state.analysis_result
base_img = st.session_state.cached_display_img

if result is not None and base_img is not None:
    verdict = result["verdict"]
    confidence = float(result.get("confidence", 0.0))
    raw_prob = float(result.get("raw_forgery_probability", 0.0))
    disclaimer = result.get(
        "disclaimer",
        "Result is a model assessment from multiple forensic signals, not a legal or definitive determination.",
    )
    scores = result.get("technique_scores", {})
    contributions = result.get("technique_contributions", {})
    reports = result.get("technique_reports", {})

    # 1. TOP VERDICT CARD
    verdict_colors = {
        "Authentic": {"bg": "#ecfdf5", "border": "#10b981", "text": "#065f46"},
        "Likely Authentic": {"bg": "#f0fdf4", "border": "#22c55e", "text": "#166534"},
        "Suspicious": {"bg": "#fffbeb", "border": "#f59e0b", "text": "#92400e"},
        "Likely Forged": {"bg": "#fef2f2", "border": "#ef4444", "text": "#991b1b"},
    }
    v_style = verdict_colors.get(verdict, verdict_colors["Suspicious"])

    st.markdown(
        f"""
        <div class='verdict-card' style='background-color:{v_style["bg"]}; border:2px solid {v_style["border"]};'>
            <div style='display:flex; justify-content:space-between; align-items:center;'>
                <div>
                    <span style='font-size:12px; font-weight:700; color:#64748b; text-transform:uppercase;'>Global Assessment</span>
                    <h2 style='color:{v_style["text"]}; margin:2px 0;'>Verdict: {verdict}</h2>
                </div>
                <div style='text-align:right;'>
                    <div style='font-size:24px; font-weight:800; color:{v_style["text"]};'>{confidence * 100:.1f}%</div>
                    <div style='font-size:12px; color:#64748b;'>Assessment Confidence</div>
                </div>
            </div>
            <div style='font-size:13px; color:#334155; margin-top:8px;'>
                Aggregated Forgery Probability: <b>{raw_prob * 100:.1f}%</b> | 
                Signals Evaluated: <b>{sum(1 for r in reports.values() if r.get('available'))} / {len(reports)}</b>
            </div>
        </div>
        <div class='disclaimer-card'>
            ⚖️ <b>Forensic Notice:</b> {disclaimer}
        </div>
        """,
        unsafe_allow_html=True,
    )

    # 2. TECHNIQUE CONTRIBUTIONS BAR CHART
    render_contribution_bar_chart(contributions)

    st.markdown("---")
    st.markdown("### 🔬 Multi-Technique Forensic Evidence Grid")
    st.caption("Side-by-side evidence panels displaying computed spatial heatmaps, keypoint matches, and signal anomalies.")

    # 3. 2-COLUMN GRID (11 PANELS IN EXACT REFERENCE ORDER)
    col_left, col_right = st.columns(2)

    # LEFT COLUMN: Panels 1, 3, 5, 7, 9, 11
    with col_left:
        # Panel 1: Copy-Move
        render_copy_move_panel(reports.get("copy_move", {}), base_img)

        # Panel 3: Double JPEG Compression
        render_double_compression_panel(reports.get("double_compression", {}), base_img)

        # Panel 5: Noise Residual
        render_noise_panel(reports.get("noise", {}), base_img)

        # Panel 7: Error Level Analysis (ELA)
        render_ela_panel(reports.get("ela", {}), base_img)

        # Panel 9: Shadow Consistency
        render_shadow_panel(reports.get("shadow", {}), base_img)

        # Panel 11: Adversarial Robustness
        render_adversarial_panel(reports.get("adversarial", {}), base_img)

    # RIGHT COLUMN: Panels 2, 4, 6, 8, 10
    with col_right:
        # Panel 2: Splicing (CNN)
        render_splicing_panel(reports.get("splicing", {}), base_img)

        # Panel 4: Metadata (EXIF)
        render_metadata_panel(reports.get("metadata", {}), base_img)

        # Panel 6: Color Filter Array (CFA)
        render_cfa_panel(reports.get("cfa", {}), base_img)

        # Panel 8: Sensor Pattern Noise (PRNU)
        render_prnu_panel(reports.get("prnu", {}), base_img)

        # Panel 10: Explainable AI (Grad-CAM)
        render_xai_panel(reports.get("splicing", {}), base_img)

    # 4. SUMMARY BAR AT BOTTOM OF GRID
    render_summary_bar(scores, reports)

    # 5. TECHNICAL PAYLOAD EXPANDER
    with st.expander("📄 View Raw Forensic API Response Payload"):
        clean_repr = {
            "verdict": result.get("verdict"),
            "confidence": result.get("confidence"),
            "raw_forgery_probability": result.get("raw_forgery_probability"),
            "technique_scores": scores,
            "technique_contributions": contributions,
            "disclaimer": disclaimer,
            "reports_summary": {
                k: {
                    "score": v.get("score"),
                    "available": v.get("available"),
                    "message": v.get("message"),
                    "details": {dk: dv for dk, dv in v.get("details", {}).items() if dk != "all_tags"},
                }
                for k, v in reports.items()
            },
        }
        st.json(clean_repr)

else:
    st.info("👈 Upload an image in the sidebar and click **Run Forensic Analysis** to view the evidence panels.")
