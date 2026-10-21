# 🕵️ Image Forgery Detection

## Report & Project Documentation

**Project:** Image Forgery Detection — CASIA 2.0
**Approach:** CNN (MobileNetV2) + Error Level Analysis + Noise/CFA Inconsistency, fused by Logistic Regression
**Interface:** FastAPI backend + Streamlit frontend

---

## 1. Abstract

Digital image tampering (forgeries) presents a growing threat to media integrity in
journalism, forensics, and legal evidence. This project builds an automated detection
pipeline that classifies an uploaded image as **authentic** or **forged** and localises the
forged regions via a heatmap overlay.

Detection relies on **three complementary techniques**, each exposing a different
signature of tampering:

1. **Splicing CNN** — a MobileNetV2 architecture, fine-tuned on CASIA 2.0, that learns
   JPEG-compression artefacts characteristic of spliced images.
2. **Error Level Analysis (ELA)** — compares the image against a re-saved, lower-quality
   version; tampered regions recompress differently from untouched ones.
3. **Noise / CFA Inconsistency** — analyses the noise residual and colour-filter-array
   pattern; spliced patches carry a different sensor-noise fingerprint.

A **Logistic Regression fusion model** learns how much to trust each technique and
combines their scores into one verdict with a confidence percentage and region heatmap.

---

## 2. System Architecture

```
                    ┌────────────────────────────────────────────┐
   Upload Image ──►  │  Preprocessing (resize → RGB → normalize)  │
                    └─────────────────────┬──────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
      ┌───────▼───────┐           ┌───────▼───────┐           ┌───────▼───────┐
      │ Splicing CNN  │           │      ELA      │           │  Noise / CFA  │
      │  (MobileNetV2)│           │     score     │           │  score        │
      └───────┬───────┘           └───────┬───────┘           └───────┬───────┘
              │                           │                           │
              └─────────────┬─────────────┴─────────────┬─────────────┘
                            ▼                           │
              ┌─────────────────────────┐               │
              │  Logistic Regression    │               │
              │  Fusion Layer           │               │
              └─────────────┬───────────┘               │
                            │                           │
              ┌─────────────▼───────────┐    ┌──────────▼─────────┐
              │ Verdict + Confidence %  │    │ Heatmap overlay of │
              │ Per-technique scores    │    │ forged regions     │
              └─────────────────────────┘    └────────────────────┘
```

### Component map

| Module | Purpose |
|---|---|
| `backend/main.py` | FastAPI server — `/health`, `/detect` endpoints |
| `backend/pipeline.py` | Wires preprocessing → 3 techniques → fusion → localization |
| `backend/preprocessing.py` | Shared resize → RGB → normalize (128×128 input) |
| `backend/fusion_model.py` | Logistic Regression fusion: train, predict, save/load |
| `backend/localization.py` | Grad-CAM-based heatmap overlay on forged regions |
| `backend/techniques/ela.py` | Error Level Analysis score |
| `backend/techniques/noise_cfa.py` | Noise / CFA inconsistency score |
| `backend/techniques/splicing_cnn.py` | MobileNetV2 CNN + Grad-CAM extractor + save/load |
| `frontend/app.py` | Streamlit UI — upload → analyse → results |
| `notebooks/02_train_splicing_cnn.py` | Trains CNN → `models/splicing_cnn.pth` |
| `notebooks/03_train_fusion_model.py` | Builds score table + fusion → `models/fusion_model.pkl` |

---

## 3. Dataset

**CASIA 2.0** (Institute of Automation, Chinese Academy of Sciences).

- **Authentic:** 7,491 images (`Au_*`)
- **Tampered:** 5,123 images (`Tp_*`), covering splicing and copy-move attacks
- Formats: JPEG and TIFF; ~2.6 GB in total

For training the CNN, the images are split randomly (85% train / 15% validation).
For the fusion model, all available images are scored by all three techniques to build
the training table — **12,614 samples** with feature order `['splicing_cnn', 'ela', 'noise']`.

---

## 4. Methodology

### 4.1 Preprocessing
Every image is loaded via PIL, converted to RGB and resized to **128×128**, then
scaled to `[0, 1]` float arrays (shared by all three techniques via
`backend/preprocessing.py`).

### 4.2 Splicing CNN (MobileNetV2)
- Backbone: `MobileNetV2` pretrained on ImageNet, backbone **frozen**.
- A new binary classifier head (`ForgeryCNN`) is trained on top.
- Training: 8 epochs, Adam (lr 1e-4), BCELoss, batch size 32.
- Output: a forgery probability in `[0, 1]`.
- Grad-CAM is used on the final conv feature map for **localisation**.

### 4.3 Error Level Analysis (ELA)
- The image is re-saved as JPEG at a low quality and the difference from the
  original is measured.
- Authentic regions recompress uniformly; tampered regions show higher ELA error.
- Output: a score in `[0, 1]` (inverted so that higher = forged).

### 4.4 Noise / CFA Inconsistency
- A noise residual is estimated by denoising and subtracting the original.
- Spliced patches carry a mismatched colour-filter-array / sensor-noise fingerprint.
- Output: a score in `[0, 1]` (higher = more inconsistent = forged).

### 4.5 Logistic Regression Fusion
- Feature vector per image: `[cnn_score, ela_score, noise_score]`.
- A `LogisticRegression` classifier is trained on the CASIA 2.0 score table.
- Learned coefficients expose which technique dominates the verdict.
- Verdict threshold: `P(forged) > 0.5`.

### 4.6 Localisation Heatmap
- Grad-CAM attention map from the CNN is blended with the ELA and noise residuals
  into a single heatmap overlaid on the uploaded image; **red = suspected forged
  regions**.

---

## 5. Results

Training with the full CASIA 2.0 set produced the following:

### 5.1 Splicing CNN (`models/splicing_cnn.pth`)

```
Epoch 1/8 - loss: 0.6331 - val_acc: 0.6681
Epoch 2/8 - loss: 0.5499 - val_acc: 0.6897
Epoch 3/8 - loss: 0.5030 - val_acc: 0.7088
Epoch 4/8 - loss: 0.4655 - val_acc: 0.7135
Epoch 5/8 - loss: 0.4299 - val_acc: 0.7104
Epoch 6/8 - loss: 0.4130 - val_acc: 0.6987
Epoch 7/8 - loss: 0.3890 - val_acc: 0.7204  ← best
Epoch 8/8 - loss: 0.3671 - val_acc: 0.7119

Best validation accuracy: 0.7204
```

Loss falls monotonically (0.633 → 0.367) with validation accuracy peaking at epoch 7
(~72%). The plateau around 70–72% is typical for a frozen-backbone model on
compressed JPEGs; unfreezing more layers or adding augmentation would push it higher.

### 5.2 Fusion Model (`models/fusion_model.pkl`)

```
Collected 12614 samples. Feature order: ['splicing_cnn', 'ela', 'noise']
Learned weights: {'splicing_cnn':  3.90,
                  'ela':         -3.95,
                  'noise':        2.10}
```

Interpretation of the fusion weights:
- **CNN +3.90** and **noise +2.10** push toward *forged* as their scores rise.
- **ELA −3.95** is inverted-headed (higher raw ELA across the board, so the sign is
  negative) — the strongest single signal of the three.
- The fusion layer therefore trusts CNN artefact cues and CFA noise most strongly,
  and learns to correct for ELA's raw scaling.

### 5.3 App output
- Verdict badge: `Authentic` (green) / `Forged` (red), with confidence %.
- Per-technique raw scores: `splicing_cnn`, `ela`, `noise` (0/1 scale).
- Contribution weights: each technique's tilt on the final decision.
- Heatmap overlay: localised suspected-tampered regions.

---

## 6. How to Run the Project

> Quick reference only — the full guide with dataset download and troubleshooting is
> in **`run.md`** and **`RUN_PROJECT.md`**.

### Step 1 — Prerequisites
Python 3.10+ with pip (`python -m pip install --upgrade pip`).

### Step 2 — Install dependencies
```bash
python -m venv .venv
.venv\Scripts\activate            # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

### Step 3 — Arrange the dataset
Create `data/raw/CASIA2/Au` and `data/raw/CASIA2/Tp` and copy authentic (`Au_*.jpg`)
and tampered (`Tp_*.jpg`) CASIA 2.0 images into them. Expected counts: Au ≈ 7,491,
Tp ≈ 5,123. If the dataset ships with the repo (e.g. `CASIA2.0_revised/`), copy from there.

### Step 4 — Train the models (once)
```bash
python notebooks/02_train_splicing_cnn.py   # → models/splicing_cnn.pth
python notebooks/03_train_fusion_model.py   # → models/fusion_model.pkl
```

### Step 5 — Start the backend + frontend
Two terminals, from the project root:

```bash
# Terminal 1 — FastAPI backend
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000

# Terminal 2 — React frontend
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

### Step 6 — Use it
Open **http://127.0.0.1:5173**, upload an image (JPG/JPEG/PNG, ≤ 10 MB), and click
**Run Forensic Synthesis**. Sample images are in `tests/`. API docs at
**http://127.0.0.1:8000/docs**; direct curl test:

```bash
curl -X POST -F "file=@tests/sample_forged.jpg" http://127.0.0.1:8000/detect
```

---

## 7. Folder Structure

```
Image_Forgery-main/
├── backend/                         # FastAPI Engine & Forensic Detectors
│   ├── main.py                     # API server (/health, /detect with CORS)
│   ├── pipeline.py                 # Multi-probe orchestrator & report generator
│   ├── preprocessing.py            # Resize → RGB → Normalize
│   ├── fusion_model.py             # Calibrated Logistic Regression fusion
│   ├── localization.py             # Fused spatial heatmap synthesizer
│   └── techniques/                 # Modular forensic detectors
│       ├── copy_move.py            # ORB keypoint matching + RANSAC homography
│       ├── double_compression.py   # 8×8 DCT histogram periodicity & DQ map
│       ├── ela.py                  # Error Level Analysis residual
│       ├── metadata.py             # Container & EXIF anomaly parsing
│       ├── noise.py                # High-pass Gaussian noise residual
│       └── splicing_cnn.py         # MobileNetV2 transfer learning & Grad-CAM
├── frontend/                        # React 19 + TypeScript + Vite + Tailwind UI
│   ├── index.html                  # Typography: Fraunces & Nunito
│   ├── package.json                # Dependencies & scripts
│   ├── vite.config.ts              # Vite server configuration
│   ├── tailwind.config.ts          # Organic / Natural design tokens
│   ├── src/                        # Component architecture
│   │   ├── App.tsx                 # Main layout coordinator
│   │   ├── api/client.ts           # Typed API client for /detect
│   │   ├── components/             # Hero, UploadZone, VerdictBlock, EvidencePlate, etc.
│   │   └── types/forensic.ts       # TypeScript API definitions
│   └── legacy_streamlit/           # Archived legacy Streamlit interface
│       ├── app.py
│       └── ui/
├── models/                          # Trained weights (splicing_cnn.pth, fusion_model.pkl)
├── notebooks/                       # Training & evaluation scripts
├── tests/                           # Unit tests for backend & pipeline
├── logs/                            # Execution and runtime logs
├── requirements.txt                 # Backend Python dependencies
├── pytest.ini                       # Test runner configuration
└── run.md                           # Quick-start run guide
```

---

## 8. Concluding Remarks

The three-technique fusion design is more robust than any single detector alone:
where the CNN may be fooled by high-quality splices, ELA and CFA noise catch
recompression and sensor-fingerprint mismatches, and vice-versa. The trained fusion
weights (Section 5.2) quantify this trade-off and make the system's reasoning
transparent. To improve accuracy further: unfreeze more backbone layers, add
augmentation, or train with a larger/balanced tampered set.

---

**Good luck!** 🎓 <small>For phase-report / viva explanations of the fused weights and
technique trade-offs, sections 4–5 of this report are the key reference.</small>#   I m a g e _ F o r g e r y _ D e t e c t i o n  
 