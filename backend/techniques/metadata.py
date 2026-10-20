"""
Metadata and EXIF forensic analysis.

Forensic principle:
Digital cameras write structured EXIF metadata (hardware make, model, timestamps,
sensor settings, GPS, lens information) directly at the moment of capture.
When an image is opened, modified, cropped, or exported via image manipulation software
(e.g., Photoshop, GIMP, Lightroom, Canva), several distinct metadata anomalies typically emerge:
1. Presence of editing software signatures in the Software or ProcessingSoftware tags.
2. Discrepancies between file modification timestamp (DateTime) and original capture timestamp (DateTimeOriginal).
3. Dimension mismatches where EXIF recorded dimensions differ from the actual pixel dimensions.
4. Stripped camera hardware signatures with remaining editing software artifacts.

Constraints:
- Reports "Metadata Anomaly Detected", never "Tampering Confirmed", unless a trusted reference exists.
- If EXIF metadata is absent, returns available=False with a clear message. Never fabricates a score.
"""

from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
from PIL import ExifTags, Image

# Known editing, graphic design, and manipulation software keywords
EDITING_SOFTWARE_KEYWORDS = [
    "photoshop",
    "gimp",
    "canva",
    "lightroom",
    "snapseed",
    "picsart",
    "paint.net",
    "affinity",
    "pixlr",
    "pixelmator",
    "coreldraw",
    "nik collection",
    "vsco",
    "photoscape",
    "fotor",
    "capture one",
]


def _sanitize_val(val: Any) -> Any:
    """Convert EXIF values (rationals, bytes, tuples) into JSON-serializable primitives."""
    if val is None or isinstance(val, (str, int, float, bool)):
        return val
    if isinstance(val, (bytes, bytearray)):
        try:
            return val.decode("utf-8", errors="replace").strip("\x00 \t\r\n")
        except Exception:
            return str(val)
    if hasattr(val, "numerator") and hasattr(val, "denominator"):
        try:
            return float(val.numerator) / float(val.denominator) if val.denominator != 0 else 0.0
        except Exception:
            return str(val)
    if isinstance(val, (list, tuple)):
        return [_sanitize_val(x) for x in val]
    if isinstance(val, dict):
        return {str(k): _sanitize_val(v) for k, v in val.items()}
    return str(val)


def _convert_dms_to_deg(dms: Any, ref: Optional[str]) -> Optional[float]:
    """Convert GPS (degrees, minutes, seconds) rational tuples to decimal degrees."""
    try:
        if not isinstance(dms, (list, tuple)) or len(dms) < 3:
            return None
        deg = _sanitize_val(dms[0])
        minute = _sanitize_val(dms[1])
        sec = _sanitize_val(dms[2])
        if not all(isinstance(x, (int, float)) for x in (deg, minute, sec)):
            return None
        dec = float(deg) + float(minute) / 60.0 + float(sec) / 3600.0
        if ref and str(ref).strip().upper() in ["S", "W"]:
            dec = -dec
        return round(dec, 6)
    except Exception:
        return None


def extract_exif(img: Image.Image) -> Tuple[Dict[str, Any], int]:
    """
    Extract standard EXIF and sub-IFD tags into a normalized dictionary.
    Returns (normalized_dict, total_tag_count).
    """
    raw_exif = img.getexif()
    if raw_exif is None or len(raw_exif) == 0:
        return {}, 0

    total_count = len(raw_exif)
    tags_by_name: Dict[str, Any] = {}

    for tag_id, val in raw_exif.items():
        tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
        tags_by_name[tag_name] = _sanitize_val(val)

    # Inspect EXIF sub-IFD (tag 0x8769 / 34665)
    try:
        exif_ifd = raw_exif.get_ifd(ExifTags.IFD.Exif)
        total_count += len(exif_ifd)
        for tag_id, val in exif_ifd.items():
            tag_name = ExifTags.TAGS.get(tag_id, str(tag_id))
            tags_by_name[tag_name] = _sanitize_val(val)
    except Exception:
        pass

    # Inspect GPS sub-IFD (tag 0x8825 / 34853)
    gps_info: Dict[str, Any] = {}
    try:
        gps_ifd = raw_exif.get_ifd(ExifTags.IFD.GPSInfo)
        total_count += len(gps_ifd)
        for tag_id, val in gps_ifd.items():
            tag_name = ExifTags.GPSTAGS.get(tag_id, str(tag_id))
            gps_info[tag_name] = _sanitize_val(val)
    except Exception:
        pass

    # Extract GPS coordinates if present
    parsed_gps = None
    if gps_info:
        lat = _convert_dms_to_deg(gps_info.get("GPSLatitude"), gps_info.get("GPSLatitudeRef"))
        lon = _convert_dms_to_deg(gps_info.get("GPSLongitude"), gps_info.get("GPSLongitudeRef"))
        alt = _sanitize_val(gps_info.get("GPSAltitude"))
        parsed_gps = {
            "latitude": lat,
            "longitude": lon,
            "altitude": alt if isinstance(alt, (int, float)) else None,
        }

    make = tags_by_name.get("Make")
    model = tags_by_name.get("Model")
    software = tags_by_name.get("Software") or tags_by_name.get("ProcessingSoftware")
    dt_orig = tags_by_name.get("DateTimeOriginal")
    dt_mod = tags_by_name.get("DateTime")
    dt_dig = tags_by_name.get("DateTimeDigitized")
    exif_w = tags_by_name.get("ExifImageWidth") or tags_by_name.get("PixelXDimension")
    exif_h = tags_by_name.get("ExifImageHeight") or tags_by_name.get("PixelYDimension")
    orientation = tags_by_name.get("Orientation")

    extracted = {
        "make": str(make).strip() if make else None,
        "model": str(model).strip() if model else None,
        "software": str(software).strip() if software else None,
        "datetime_original": str(dt_orig).strip() if dt_orig else None,
        "datetime_modified": str(dt_mod).strip() if dt_mod else None,
        "datetime_digitized": str(dt_dig).strip() if dt_dig else None,
        "exif_dimensions": [int(exif_w), int(exif_h)] if (exif_w and exif_h) else None,
        "orientation": int(orientation) if isinstance(orientation, (int, float)) else None,
        "gps": parsed_gps,
        "all_tags": tags_by_name,
    }
    return extracted, total_count


def analyze(image_path: Union[str, Path, Image.Image]) -> dict:
    """
    Standard forensic analysis interface for metadata.
    Returns:
        score: float in [0.0, 1.0] or None if unavailable
        available: bool
        message: str describing forensic finding
        map: None (metadata is global, not spatial)
        details: dict of parsed metadata and detected anomalies
    """
    opened_img = None
    try:
        if isinstance(image_path, Image.Image):
            img = image_path
        else:
            opened_img = Image.open(image_path)
            img = opened_img
        actual_w, actual_h = img.size
        meta, tag_count = extract_exif(img)
        img_format = getattr(img, "format", "Unknown")
    except Exception as e:
        return {
            "score": None,
            "available": False,
            "message": f"Metadata analysis unavailable: could not open image ({str(e)}).",
            "map": None,
            "details": {},
        }
    finally:
        if opened_img is not None:
            opened_img.close()

    # If no EXIF was present
    if tag_count == 0 or not meta:
        return {
            "score": None,
            "available": False,
            "message": "EXIF metadata unavailable for this image.",
            "map": None,
            "details": {
                "actual_dimensions": [actual_w, actual_h],
                "format": getattr(img, "format", "Unknown"),
            },
        }

    anomalies: List[str] = []
    risk_score = 0.0

    # 1. Check for editing software
    software = meta.get("software")
    if software:
        lower_sw = software.lower()
        matched_kw = next((kw for kw in EDITING_SOFTWARE_KEYWORDS if kw in lower_sw), None)
        if matched_kw:
            anomalies.append(f"editing software tag present ({software})")
            risk_score += 0.55
        else:
            anomalies.append(f"software tag present ({software})")
            risk_score += 0.25

    # 2. Check for dimension mismatch
    exif_dims = meta.get("exif_dimensions")
    if exif_dims and len(exif_dims) == 2:
        ew, eh = exif_dims
        # Account for possible orientation swaps (e.g. 90/270 deg rotation)
        orientation = meta.get("orientation")
        if orientation in [5, 6, 7, 8]:
            ew_eff, eh_eff = eh, ew
        else:
            ew_eff, eh_eff = ew, eh

        if (actual_w, actual_h) != (ew_eff, eh_eff) and (actual_w, actual_h) != (ew, eh):
            anomalies.append(
                f"dimension mismatch: EXIF specifies {ew}x{eh}, actual is {actual_w}x{actual_h}"
            )
            risk_score += 0.35

    # 3. Check for timestamp discrepancies
    dt_orig = meta.get("datetime_original")
    dt_mod = meta.get("datetime_modified")
    if dt_orig and dt_mod and dt_orig != dt_mod:
        anomalies.append(
            f"timestamp discrepancy between original capture ({dt_orig}) and modification ({dt_mod})"
        )
        risk_score += 0.20

    # 4. Check for missing camera hardware make/model while other processing tags exist
    make = meta.get("make")
    model = meta.get("model")
    if not make and not model and tag_count > 3:
        anomalies.append("camera make and model tags absent despite presence of other metadata")
        risk_score += 0.15

    # Final score calibration
    if anomalies:
        final_score = float(round(min(1.0, max(0.40, risk_score)), 4))
        message = f"Metadata Anomaly Detected: {'; '.join(anomalies)}."
    else:
        # Camera metadata present with no anomalies
        final_score = 0.05
        cam_desc = f"{make} {model}".strip() if (make or model) else "recorded device"
        message = f"Metadata consistent with original camera capture ({cam_desc})."

    details = {
        "make": make,
        "model": model,
        "software": software,
        "datetime_original": dt_orig,
        "datetime_modified": dt_mod,
        "datetime_digitized": meta.get("datetime_digitized"),
        "gps": meta.get("gps"),
        "exif_dimensions": exif_dims,
        "actual_dimensions": [actual_w, actual_h],
        "orientation": meta.get("orientation"),
        "total_exif_tags_count": tag_count,
        "anomalies_detected": anomalies,
    }

    return {
        "score": final_score,
        "available": True,
        "message": message,
        "map": None,
        "details": details,
    }
