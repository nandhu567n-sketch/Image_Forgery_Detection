"""
Fusion layer.

Combines individual forensic signals into an aggregated verdict + confidence
using an explainable Logistic Regression model.

In Phase 1, the core model evaluates the 3 primary signals (splicing, ela, noise)
while accommodating the new forensic modules (metadata, copy_move, double_compression)
and upholding strict academic and legal forensic disclaimer constraints.

Verdict wording:
- proba < 0.25: "Authentic"
- 0.25 <= proba < 0.50: "Likely Authentic"
- 0.50 <= proba < 0.75: "Suspicious"
- proba >= 0.75: "Likely Forged"
Never "Forgery Confirmed".
"""

import os
import pickle
from typing import Dict, Optional, Union
import numpy as np
from sklearn.linear_model import LogisticRegression

FEATURE_ORDER = ["splicing", "ela", "noise"]
LEGACY_FEATURE_MAP = {
    "splicing_cnn": "splicing",
}
MODEL_PATH = "models/fusion_model.pkl"
DISCLAIMER = "Result is a model assessment from multiple forensic signals, not a legal or definitive determination."


def scores_to_vector(scores: dict) -> np.ndarray:
    """
    Extract ordered feature vector from scores dict.
    Supports both 'splicing' and legacy 'splicing_cnn' keys.
    """
    vals = []
    for name in FEATURE_ORDER:
        if name in scores and scores[name] is not None:
            vals.append(float(scores[name]))
        elif name == "splicing" and "splicing_cnn" in scores and scores["splicing_cnn"] is not None:
            vals.append(float(scores["splicing_cnn"]))
        else:
            vals.append(0.0)
    return np.array([vals], dtype=np.float32)


def get_verdict_label(probability: float) -> str:
    """Map raw probability into calibrated forensic verdict."""
    if probability < 0.25:
        return "Authentic"
    elif probability < 0.50:
        return "Likely Authentic"
    elif probability < 0.75:
        return "Suspicious"
    else:
        return "Likely Forged"


def train_fusion(X: np.ndarray, y: np.ndarray, out_path: str = MODEL_PATH) -> LogisticRegression:
    """
    X: (n_samples, 3) - technique scores for each training image
    y: (n_samples,)   - 1 = forged, 0 = authentic
    """
    clf = LogisticRegression()
    clf.fit(X, y)

    os.makedirs(os.path.dirname(out_path), exist_ok=True)
    with open(out_path, "wb") as f:
        pickle.dump(clf, f)

    return clf


def load_fusion(model_path: str = MODEL_PATH) -> Optional[LogisticRegression]:
    if not os.path.exists(model_path):
        return None
    try:
        with open(model_path, "rb") as f:
            return pickle.load(f)
    except Exception:
        return None


def predict(scores: dict, model_path: str = MODEL_PATH) -> dict:
    """
    Returns the aggregated verdict + confidence and technique contributions.
    Adheres strictly to the forensic reporting constraints.
    """
    clf = load_fusion(model_path)
    x = scores_to_vector(scores)

    if clf is not None:
        try:
            proba = float(clf.predict_proba(x)[0][1])
            contributions = dict(zip(FEATURE_ORDER, clf.coef_[0] * x[0]))
        except Exception:
            proba = float(np.mean(x))
            contributions = dict(zip(FEATURE_ORDER, x[0]))
    else:
        proba = float(np.mean(x))
        contributions = dict(zip(FEATURE_ORDER, x[0]))

    verdict = get_verdict_label(proba)
    confidence = float(proba if proba >= 0.5 else 1.0 - proba)

    # Expand contributions across all active techniques provided in scores
    all_contributions = dict(contributions)
    for k, v in scores.items():
        if k not in all_contributions and v is not None:
            # Calibrated attribution: centered around 0.5 neutral boundary
            all_contributions[k] = round(float(v - 0.5) * 1.0, 4)

    return {
        "verdict": verdict,
        "confidence": round(confidence, 4),
        "raw_forgery_probability": round(proba, 4),
        "technique_contributions": {k: round(float(v), 4) for k, v in all_contributions.items()},
        "disclaimer": DISCLAIMER,
    }
