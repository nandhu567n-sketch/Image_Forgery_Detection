# 🚀 AI-Driven Multi-Technique Forensic Framework — Complete Run Guide

A step-by-step operational guide for running, developing, and testing the **AI-Driven Multi-Technique Image Forensic Analysis and Forgery Detection Framework**.

```
Upload Image ──► 11 Forensic Probes ──► Logistic Regression Fusion
             ──► Calibrated Verdict + Posterior P(Forg) + 11 Evidence Plates + PDF Report
```

---

## 📋 System Prerequisites

| Tool | Minimum Version | Tested With | Purpose |
| :--- | :--- | :--- | :--- |
| **Python** | 3.10+ | 3.11.9 | FastAPI backend, PyTorch, OpenCV, Scikit-Learn |
| **Node.js** | 18+ | 24.18.0 | React 19, Vite 8, Tailwind CSS compilation |
| **npm** | 9+ | 11.6.2 | Frontend package management |
| **Web Browser** | Any modern browser | Chrome, Edge, Firefox, Brave | Editorial UI dashboard & PDF generation |

---

## 📁 Project Architecture & Layout

The project is structured into **`backend/`** and **`frontend/`** workspaces:

```
Image_Forgery-main/
├── backend/                         # FastAPI Engine & Forensic Probes
│   ├── main.py                     # API server (/detect, /health with CORS)
│   ├── pipeline.py                 # Multi-technique orchestrator & report generator
│   ├── preprocessing.py            # Image tensor scaling & normalization (128x128 & 224x224)
│   ├── fusion_model.py             # Calibrated Logistic Regression fusion layer
│   ├── localization.py             # Fused spatial evidence map synthesizer
│   └── techniques/                 # Modular forensic detectors
│       ├── copy_move.py            # Plate 01: ORB keypoint matching + RANSAC homography
│       ├── splicing_cnn.py         # Plate 02: MobileNetV2 transfer learning & Grad-CAM (Plate 10)
│       ├── double_compression.py   # Plate 03: 8×8 DCT histogram periodicity & DQ map
│       ├── metadata.py             # Plate 04: Container & EXIF anomaly parsing
│       ├── noise.py                # Plate 05: High-pass Gaussian spatial noise residual
│       ├── cfa.py                  # Plate 06: Bayer pattern demosaicing artifact detector
│       ├── ela.py                  # Plate 07: Error Level Analysis residual
│       ├── prnu.py                 # Plate 08: Photo-Response Non-Uniformity sensor noise
│       ├── shadow.py               # Plate 09: Physical shadow & illuminant direction consistency
│       └── adversarial.py          # Plate 11: Perturbation attack stress-testing (FGSM/PGD/Noise)
├── frontend/                        # React 19 + TypeScript + Vite + Tailwind UI
│   ├── index.html                  # Typography: Fraunces & Nunito Google Fonts
│   ├── package.json                # Frontend dependencies & build scripts
│   ├── vite.config.ts              # Vite bundler configuration
│   ├── tailwind.config.ts          # Organic / Natural design tokens
│   ├── postcss.config.js           # PostCSS configuration
│   ├── tsconfig.json               # TypeScript compiler options
│   ├── public/                     # Static web assets
│   ├── src/                        # React component hierarchy
│   │   ├── App.tsx                 # Main 8-section layout coordinator
│   │   ├── main.tsx                # React DOM mount point
│   │   ├── index.css               # Paper grain overlay, organic blob classes, reset
│   │   ├── api/client.ts           # Typed fetch client for FastAPI /detect
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Hero.tsx            # Floating glassmorphic nav & Fraunces hero
│   │   │   ├── UploadZone.tsx      # Pebble dropzone & sample generators
│   │   │   ├── VerdictBlock.tsx    # Warm elevated card & calibrated scale
│   │   │   ├── EvidencePlate.tsx   # 11 evidence cards in 2-column grid
│   │   │   ├── ImageCompare.tsx    # Dual-view, multiply overlay, 5-step scale
│   │   │   ├── ScoreMeter.tsx      # Rounded progress track & Nunito metrics
│   │   │   ├── StatusTag.tsx       # Soft rounded pill badges
│   │   │   ├── ContributionChart.tsx# Zero-centered horizontal attribution bars
│   │   │   ├── MetadataTable.tsx   # EXIF container table with anomaly flags
│   │   │   ├── AdversarialTable.tsx# Perturbation stress benchmarks table
│   │   │   ├── PullQuote.tsx       # Handcrafted Fraunces italic synopsis
│   │   │   ├── SectionRule.tsx     # Timber divider with pebble emblem
│   │   │   └── Footer.tsx          # Earth-toned laboratory footer
│   │   └── types/forensic.ts       # TypeScript API definitions
│   └── legacy_streamlit/           # Archived legacy Streamlit interface
│       ├── app.py
│       └── ui/
├── models/                          # Trained model artifacts & weights
│   ├── splicing_cnn.pth            # Fine-tuned MobileNetV2 weights
│   └── fusion_model.pkl            # Trained Logistic Regression fusion model
├── notebooks/                       # Training & evaluation scripts
├── tests/                           # Unit tests for backend & pipeline (29 tests)
├── logs/                            # Server, runtime, and stderr/stdout logs
├── requirements.txt                 # Backend Python dependencies
├── pytest.ini                       # Test runner configuration
└── README.md                        # Framework overview and documentation
```

---

## ⚡ First-Time Installation

### Step 1: Install Python Backend Dependencies

From the project root:

```powershell
# Activate your existing virtual environment:
.\.venv\Scripts\Activate.ps1

# Install or upgrade backend dependencies:
pip install -r requirements.txt
```

### Step 2: Install React Frontend Dependencies

From the project root:

```powershell
cd frontend
npm install
cd ..
```

---

## 🚀 Running the Project

### 1. Launch Backend API (Terminal 1)

From the project root:

```powershell
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

* **Health Endpoint**: `http://127.0.0.1:8000/health` (returns `{"status":"ok"}`)
* **Interactive Swagger Docs**: `http://127.0.0.1:8000/docs`
* **Analysis Route**: `POST http://127.0.0.1:8000/detect`

### 2. Launch React Dashboard (Terminal 2)

From the project root:

```powershell
cd frontend
npm run dev -- --host 127.0.0.1 --port 5173
```

* Open your browser to: **`http://127.0.0.1:5173`**

---

## 🧭 Dashboard Walkthrough & User Guide

1. **Header & Status**: The floating pill navbar verifies backend connectivity (`Engine Active`) and references the CASIA 2.0 protocol.
2. **Ingest Image**:
   * Drag and drop an image (`.jpg`, `.jpeg`, `.png`, max 10 MB) into the pebble dropzone.
   * Or click **`Generate Spliced Test Pattern`** / **`Generate Pristine Test Pattern`** to test with built-in benchmark images.
3. **Execute Analysis**: Click **`Run Forensic Synthesis`**. The pipeline executes all 11 forensic probes in parallel.
4. **Review Verdict**: The elevated **Verdict Card** displays:
   * Calibrated categorical finding (`Authentic`, `Likely Authentic`, `Suspicious`, or `Likely Forged`).
   * Posterior probability $P(\text{Forg})$ and ensemble confidence.
   * Fused spatial localization preview map.
   * Academic legal disclaimer.
5. **Inspect the 11 Evidence Plates**:
   * **Plate 01**: Copy-Move Keypoint Replication (ORB + RANSAC).
   * **Plate 02**: Splicing CNN Backbone (MobileNetV2 feature representations).
   * **Plate 03**: Double JPEG Compression (8×8 DCT histogram periodicity & DQ map).
   * **Plate 04**: Container & EXIF Structures (Anomaly parser & editing tool flags).
   * **Plate 05**: Noise Residual Analysis (High-pass Gaussian variance).
   * **Plate 06**: Color Filter Array (Bayer pattern demosaicing inconsistency).
   * **Plate 07**: Error Level Analysis (95% recompression error surface).
   * **Plate 08**: PRNU Sensor Fingerprint (Camera attribution coupling).
   * **Plate 09**: Shadow & Illuminant Consistency (Physical lighting trajectory).
   * **Plate 10**: Grad-CAM Explainability (Final conv layer activation map).
   * **Plate 11**: Adversarial Stress Robustness (FGSM, PGD, DQ, noise resilience table).
6. **Examine Signal Dynamics**: View the **Feature Attribution Chart** to see which techniques pushed the score toward forged (+) versus authentic (-).
7. **Export Juridical Dossier**: Click **`Download / Print Forensic Dossier (PDF)`** at the bottom to generate an official print/PDF forensic record.

---

## 🧪 Testing & Verification

### Run the Backend Automated Test Suite (29 Tests)

From the project root:

```powershell
.\.venv\Scripts\python.exe -m pytest
```

All 29 unit tests cover:
* **Copy-Move (Plate 01)**: ORB keypoint clustering, feature matching, and RANSAC inlier filtering (`tests/test_copy_move.py`)
* **Double JPEG Compression (Plate 03)**: 8×8 DCT histogram periodicity, DQ grid mapping, and PNG fallback (`tests/test_double_compression.py`)
* **Metadata Container (Plate 04)**: EXIF tag inspection, camera signature validation, and timestamp sanity (`tests/test_metadata.py`)
* **Noise Residual (Plate 05)**: Gaussian high-pass spatial filtering and local variance disparity mapping (`tests/test_noise.py`)
* **Color Filter Array (Plate 06)**: Bayer pattern demosaicing residual and green Laplacian periodicity (`tests/test_cfa.py`)
* **PRNU Sensor Fingerprint (Plate 08)**: High-frequency sensor noise extraction and local window self-consistency (`tests/test_prnu.py`)
* **Shadow Consistency (Plate 09)**: Cast shadow segmentation, gradient orientation fields, and illuminant alignment (`tests/test_shadow.py`)
* **Adversarial Robustness (Plate 11)**: FGSM ($\epsilon = 0.03$), PGD, Gaussian noise, and spatial kurtosis stress testing (`tests/test_adversarial.py`)
* **Pipeline Orchestrator & Fusion**: Multi-probe aggregation contract, verdict calibration, and localization overlay (`tests/test_pipeline.py`)

### Test Frontend Production Build

From the `frontend/` directory:

```powershell
cd frontend
npm run build
```

Compiles TypeScript and outputs the production bundle in `frontend/dist/`.

### Direct API Testing via cURL

From the project root:

```powershell
curl.exe -X POST -F "file=@tests/sample_forged.jpg" http://127.0.0.1:8000/detect
```

---

## 🔬 Optional: Legacy Streamlit UI

If you ever wish to launch the legacy Streamlit interface for comparison:

```powershell
.\.venv\Scripts\python.exe -m streamlit run frontend/legacy_streamlit/app.py --server.port 8501
```

Access at `http://localhost:8501`.

---

## 🛠️ Troubleshooting & FAQ

* **Port 8000 or 5173 is already in use**:
  * Check listening ports: `Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue`
  * Terminate any lingering process: `Stop-Process -Id <PID> -Force`
* **CORS Error in Browser Console**:
  * Ensure the FastAPI backend is running with `CORSMiddleware` (configured by default in `backend/main.py`).
* **Double Compression says "Unavailable"**:
  * Double compression analysis analyzes 8×8 Discrete Cosine Transform quantization tables and only applies to JPEG containers. On PNG uploads, it properly reports `available: false` without fabricating scores.
* **Metadata shows "Container Stripped"**:
  * Modern messaging apps (WhatsApp, Telegram) and web platforms strip EXIF metadata for privacy. This is correctly reported as `available: false` with an explanatory note.