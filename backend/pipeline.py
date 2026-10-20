"""
Forensic Pipeline Orchestrator.

Ties together preprocessing -> multi-technique forensic modules -> fusion -> localization.
Collects standardized scores and visual evidence maps across all forensic techniques:
copy_move, splicing, double_compression, metadata, noise, cfa, ela, prnu, shadow, adversarial.
"""

import base64
import io
import os
from pathlib import Path
import tempfile
from typing import Any, Dict, Optional, Union
import numpy as np
from PIL import Image

from backend import fusion_model
from backend.localization import build_localization
from backend.preprocessing import preprocess, preprocess_for_display
from backend.techniques import (
    adversarial,
    cfa,
    copy_move,
    double_compression,
    ela,
    metadata,
    noise,
    prnu,
    shadow,
    splicing_cnn,
)

_model_cache: Dict[str, Any] = {}

TECHNIQUE_KEYS = [
    "copy_move",
    "splicing",
    "double_compression",
    "metadata",
    "noise",
    "cfa",
    "ela",
    "prnu",
    "shadow",
    "adversarial",
]


def get_cnn_model():
    """Cache and return fine-tuned or initialized MobileNetV2 model."""
    if "cnn" not in _model_cache:
        _model_cache["cnn"] = splicing_cnn.load_model()
    return _model_cache["cnn"]


def image_to_base64(img: Image.Image) -> str:
    """Encode PIL image to PNG base64 string."""
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return base64.b64encode(buf.getvalue()).decode("utf-8")


def map_to_base64(m: Optional[np.ndarray]) -> Optional[str]:
    """Encode a 2D float32 [0, 1] map to base64 grayscale PNG."""
    if m is None:
        return None
    try:
        norm = np.clip(m, 0.0, 1.0)
        uint8_map = np.uint8(255.0 * norm)
        pil_map = Image.fromarray(uint8_map)
        buf = io.BytesIO()
        pil_map.save(buf, format="PNG")
        return base64.b64encode(buf.getvalue()).decode("utf-8")
    except Exception:
        return None


def sanitize_for_json(obj: Any) -> Any:
    """Recursively convert NumPy scalars and arrays to native Python primitives."""
    if obj is None or isinstance(obj, (bool, str, int)):
        return obj
    if isinstance(obj, float):
        return obj
    if isinstance(obj, (np.floating, np.float32, np.float64, np.float16)):
        return float(obj)
    if isinstance(obj, (np.integer, np.int32, np.int64, np.int16, np.int8)):
        return int(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, (list, tuple)):
        return [sanitize_for_json(item) for item in obj]
    if isinstance(obj, dict):
        return {str(k): sanitize_for_json(v) for k, v in obj.items()}
    return str(obj)


def run_pipeline(image_input: Union[str, Path, Image.Image]) -> dict:
    """
    Run multi-technique forensic analysis on the input image.

    Accepts:
        image_input: File path (str or Path) or PIL Image instance.

    Returns:
        Structured forensic result dictionary including:
        - verdict, confidence, raw_forgery_probability
        - technique_scores (with all 10 technique keys)
        - technique_contributions
        - highlighted_image_base64
        - disclaimer
        - technique_reports
    """
    temp_path: Optional[str] = None

    if isinstance(image_input, Image.Image):
        img = image_input.convert("RGB")
        fn = getattr(image_input, "filename", None)
        if fn and os.path.isfile(fn):
            analysis_path = fn
        else:
            # Preserve format if known
            fmt = getattr(image_input, "format", "PNG")
            ext = ".jpg" if fmt == "JPEG" else ".png"
            with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
                temp_path = tmp.name
                image_input.save(temp_path, format=fmt)
            analysis_path = temp_path
    else:
        analysis_path = str(image_input)
        img = Image.open(analysis_path).convert("RGB")

    try:
        cnn_model = get_cnn_model()

        # 1. Execute multi-technique forensic analysis
        cm_res = copy_move.analyze(analysis_path)
        splicing_res = splicing_cnn.analyze(analysis_path, model=cnn_model)
        dc_res = double_compression.analyze(analysis_path)
        meta_res = metadata.analyze(analysis_path)
        noise_res = noise.analyze(analysis_path)
        ela_res = ela.analyze(analysis_path)
        cfa_res = cfa.analyze(analysis_path)
        prnu_res = prnu.analyze(analysis_path)
        shadow_res = shadow.analyze(analysis_path)
        adversarial_res = adversarial.analyze(analysis_path, model=cnn_model)

        all_reports: Dict[str, dict] = {
            "copy_move": cm_res,
            "splicing": splicing_res,
            "double_compression": dc_res,
            "metadata": meta_res,
            "noise": noise_res,
            "cfa": cfa_res,
            "ela": ela_res,
            "prnu": prnu_res,
            "shadow": shadow_res,
            "adversarial": adversarial_res,
        }

        # 3. Collect scores and visuals dicts with exact required keys
        scores: Dict[str, Optional[float]] = {
            k: all_reports[k]["score"] for k in TECHNIQUE_KEYS
        }

        visuals: Dict[str, Optional[np.ndarray]] = {
            k: all_reports[k]["map"] for k in TECHNIQUE_KEYS
        }

        # 4. Fusion model decision (evaluates active features)
        decision = fusion_model.predict(scores)

        # 5. Spatial localization / overlay
        display_img = preprocess_for_display(img)
        highlighted = build_localization(display_img, visuals)

        output = {
            "verdict": decision["verdict"],
            "confidence": decision["confidence"],
            "raw_forgery_probability": decision["raw_forgery_probability"],
            "technique_scores": {
                k: (round(float(v), 4) if v is not None else None) for k, v in scores.items()
            },
            "technique_contributions": {
                k: round(float(v), 4) for k, v in decision["technique_contributions"].items()
            },
            "highlighted_image_base64": image_to_base64(highlighted),
            "disclaimer": decision["disclaimer"],
            "technique_reports": {
                k: {
                    "score": (round(float(all_reports[k]["score"]), 4) if all_reports[k]["score"] is not None else None),
                    "available": bool(all_reports[k]["available"]),
                    "message": str(all_reports[k]["message"]),
                    "map_base64": map_to_base64(all_reports[k]["map"]),
                    "details": all_reports[k]["details"],
                }
                for k in TECHNIQUE_KEYS
            },
        }

        # Add slot 11: Grad-CAM Explainability (XAI)
        output["technique_reports"]["xai"] = {
            "score": (round(float(splicing_res["score"]), 4) if splicing_res["score"] is not None else None),
            "available": bool(splicing_res["available"]),
            "message": "Grad-CAM visual explanation highlighting neural activations in the final convolutional layer of MobileNetV2.",
            "map_base64": map_to_base64(splicing_res["map"]),
            "details": {
                "method": "Grad-CAM",
                "target_layer": "MobileNetV2 features[-1]",
                "resolution": "7x7 feature space upsampled to input resolution",
            },
        }

        return sanitize_for_json(output)

    finally:
        if temp_path and os.path.exists(temp_path):
            try:
                os.remove(temp_path)
            except OSError:
                pass
