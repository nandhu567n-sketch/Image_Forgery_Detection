# AI-Driven Multi-Technique Image Forensic Analysis and Forgery Detection Framework
## IEEE Conference Research Paper Preparation Dossier

---

### Checkpoint 1: Project Scope, Baseline Evidence, and Paper Boundary Definition

#### 1. Evidence Summary (Supported by Codebase, CASIA 2.0 Experiments, & Implementation)

* **Problem Formulation:** Digital image tampering—including composite splicing, copy-move duplication, compression re-saving, illumination/shadow mismatch, and anti-forensic adversarial perturbation—poses severe threats to media authenticity, legal verification, and scientific evidence. Single-probe forensic detectors suffer from domain fragility, high false-positive rates on complex textures, and susceptibility to compression artifacts.
* **Proposed Method:** An integrated multi-technique forensic analysis framework that evaluates input imagery across 11 complementary physical, statistical, container, and neural probes, aggregating their outputs through an explainable, calibrated Logistic Regression fusion layer into standardized probabilistic verdicts and localized spatial tamper heatmaps.
* **Forensic Module Decomposition (11 Slots):**
  1. *Copy-Move Forgery:* ORB keypoint descriptor extraction and RANSAC affine homography clustering for duplicated region localization.
  2. *Splicing CNN:* Transfer-learned MobileNetV2 feature extractor with fine-tuned binary classifier head detecting boundary splicing artifacts.
  3. *Double JPEG Compression:* $8 \times 8$ block Discrete Cosine Transform (DCT) histogram coefficient periodicity and periodic DQ artifact mapping.
  4. *Metadata Container Inspection:* Exchangeable Image File Format (EXIF) tag parsing, camera profile cross-checking, and quantization table signature matching.
  5. *Noise Variance Residuals:* High-pass Gaussian filtering and local spatial block variance disparity analysis exposing spliced alien noise substrates.
  6. *Color Filter Array (CFA):* Green-channel Laplacian demosaicing residual analysis and Bayer periodic pattern consistency evaluation.
  7. *Error Level Analysis (ELA):* Multi-pass JPEG recompression error variance highlighting differential compression decay across composite boundaries.
  8. *Sensor Fingerprint (PRNU):* Photo-Response Non-Uniformity noise extraction via adaptive Wiener filtering and local spatial self-consistency estimation.
  9. *Shadow & Illuminant Consistency:* Physical shadow segmentation, circular gradient statistics, and cross-object illuminant angle contradiction mapping.
  10. *Visual Explainability (XAI):* Grad-CAM attention mapping on MobileNetV2's terminal convolutional layer for localized neural attribution.
  11. *Adversarial Robustness Stress-Testing:* Multi-vector perturbation assessment across FGSM ($\epsilon = 0.03$), PGD, additive Gaussian noise, JPEG recompression, and high-frequency spatial kurtosis anomaly detection.
* **Decision Layer & Calibration:** A calibrated Logistic Regression fusion layer trained on empirical score distributions that weights positive and negative evidence, mapping raw probabilities to 4 standardized forensic verdicts: `Authentic` ($P < 0.25$), `Likely Authentic` ($0.25 \le P < 0.50$), `Suspicious` ($0.50 \le P < 0.75$), and `Likely Forged` ($P \ge 0.75$), with zero tolerance for definitive "Forgery Confirmed" claims.
* **Benchmark & Training Data:** Empirical training on the CASIA v2.0 dataset (Institute of Automation, Chinese Academy of Sciences), encompassing 7,491 authentic images (`Au_*`) and 5,123 tampered images (`Tp_*`), yielding 12,614 total samples.
* **Actual System Stage:** **Prototype / Mid-Development (Post-Validation Baseline).** The backend pipeline, all 11 modular detector probes, trained MobileNetV2 weights (`models/splicing_cnn.pth`), trained fusion weights (`models/fusion_model.pkl`), and 29 passing unit tests are fully functional.
* **Empirical Measurements Available (No Fabrication):**
  - MobileNetV2 fine-tuning on CASIA 2.0 (8 epochs, batch size 32, Adam optimizer with lr $10^{-4}$): loss reduced monotonically from $0.6331 \to 0.3671$; peak validation accuracy reached $72.04\%$ at Epoch 7.
  - Logistic Regression fusion weights across 12,614 scored CASIA 2.0 samples: Splicing CNN weight $+3.90$, ELA weight $-3.95$, Noise weight $+2.10$.
* **Identified Gaps & Operational Constraints:**
  - Input resolution: CNN features currently operate on $128 \times 128$ normalized tensors upscaled to $224 \times 224$ for MobileNetV2 inference.
  - PRNU matching operates in blind spatial self-consistency mode when specific reference camera sensor flat-fields are unavailable.
  - Metadata probe is constrained by upstream social media stripping of EXIF data.
* **Ethical and Academic Framing:** Results are strictly presented as model-assisted probabilistic forensic evidence with an explicit disclaimer: *"Result is a model assessment from multiple forensic signals, not a legal or definitive determination."*

---

#### 2. Stated Assumptions & Questions

##### Assumptions:
1. **Target Class & Layout:** Standard IEEE two-column conference format (`IEEEtran.cls`, A4 paper size, 10pt font).
2. **Author Information:** Author names, affiliations, and email blocks remain blank per double-blind / student template guidelines.
3. **Template Base:** Standard IEEE Conference template conventions (standard headings, unnumbered Abstract, unnumbered References, and IEEE-style numbered equations/tables).
4. **Data Fidelity:** Results and Analysis will report only the exact verified experimental figures (72.04% validation accuracy on CASIA 2.0, empirical fusion weights, and live probe diagnostic outputs). No simulated or unverified metrics will be introduced.

##### Clarifying Questions (At Most 5):
1. **Target Venue / Track:** Do you have a specific target IEEE conference or workshop in mind (e.g., IEEE ICIP, IEEE WIFS, IEEE MIPR), or should the paper target a general IEEE Multimedia / Security & Forensics conference?
2. **Page Limit:** What is your intended target page limit (e.g., standard 4 pages or 6 pages)?
3. **Template Attachment:** Did you have a separate `.docx` or `.pdf` synopsis file to supply, or should we continue using the repository's verified implementation, architecture, and CASIA 2.0 experimental records as the primary reference?
4. **Experimental Focus:** Would you like Section IV (Result and Analysis) to focus primarily on the quantitative validation of the MobileNetV2 and fusion model on CASIA 2.0, or should it also include qualitative case-study plates comparing splicing vs. copy-move vs. authentic samples?
5. **Author Affiliation Placeholders:** Should the author placeholder block remain completely blank, or contain institutional placeholders (e.g., *Department of Computer Science and Engineering*)?

---

#### 3. Scope of Claims: What the Paper WILL and WILL NOT Make

##### What the Paper WILL Claim:
* Multi-technique forensic fusion significantly mitigates single-detector fragility, resolving blind spots inherent in isolated ELA, noise, or keypoint analysis.
* Transfer learning using a frozen MobileNetV2 backbone offers a lightweight, computationally feasible detector for splicing artifacts in resource-constrained environments.
* Logistic regression fusion provides explainable, linear attributions ($w_i \cdot x_i$) that decompose complex multi-modal forensic verdicts for human investigators.
* Spatial localization heatmaps combined with numerical confidence metrics provide interpretable visual corroboration of tampering boundaries.

##### What the Paper WILL NOT Claim:
* The paper will **NOT** claim unverified high accuracy figures (e.g., 98%+), restricting reported metrics strictly to the actual 72.04% validation accuracy achieved on CASIA 2.0.
* The paper will **NOT** claim definitive legal certainty or use vocabulary like "Forgery Confirmed."
* The paper will **NOT** claim full camera-to-image matching when physical sensor reference databases are missing, explicitly reporting the technique as blind local noise self-consistency.
* The paper will **NOT** claim universal zero-shot resilience against generative diffusion or deepfake architectures outside the evaluated tampering categories.

---

### Strict Section Structure (Per IEEE Format)
- **Abstract** (Unnumbered, 150–250 words)
- **Index Terms** (4–6 IEEE keywords)
- **I. Introduction**
- **II. Literature Survey** (including structured comparison table)
- **III. Implementation Methodology** (TikZ architecture pipeline, mathematical formulation of probes, fusion layer)
- **IV. Result and Analysis** (CASIA 2.0 training curves, fusion attribution weights, diagnostic case studies)
- **V. Conclusion** (Summary of contributions and 1–2 sentences of planned extensions)
- **References** (Numbered IEEE citations with verified DOIs)
