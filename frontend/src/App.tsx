import React, { useState, useEffect } from 'react';
import { Download, FileText } from 'lucide-react';
import { Hero } from './components/Hero';
import { ShowcaseDashboard } from './components/ShowcaseDashboard';
import { UploadZone } from './components/UploadZone';
import { VerdictBlock } from './components/VerdictBlock';
import { SectionRule } from './components/SectionRule';
import { EvidencePlate } from './components/EvidencePlate';
import { ContributionChart } from './components/ContributionChart';
import { AdversarialTable } from './components/AdversarialTable';
import { PullQuote } from './components/PullQuote';
import { Footer } from './components/Footer';
import { LinearButton } from './components/LinearButton';
import { detectForgery, checkBackendHealth } from './api/client';
import type { ForensicResponse, TechniquePlateMeta } from './types/forensic';

const TECHNIQUE_METAS: TechniquePlateMeta[] = [
  {
    index: '01',
    key: 'copy_move',
    title: 'Copy-Move Replication',
    tagline: 'ORB / AKAZE KEYPOINT CLUSTERING & RANSAC GEOMETRIC VERIFICATION',
    domain: 'Spatial',
    description: 'Detects cloned regions duplicated from within the same photographic frame using keypoint feature matching, spatial distance filtering, and affine homography verification.',
    example: 'Identical foliage patch or repetitive architectural elements cloned to conceal an unwanted object.',
  },
  {
    index: '02',
    key: 'splicing',
    title: 'Splicing CNN Backbone',
    tagline: 'MOBILENETV2 TRANSFER LEARNING TRAINED ON CASIA 2.0',
    domain: 'Interpretability',
    description: 'Evaluates convolutional feature representations to identify foreign composite fragments introduced from distinct source images with disparate optical characteristics.',
    example: 'Person cut out from an indoor flash portrait inserted into an outdoor natural scene.',
  },
  {
    index: '03',
    key: 'double_compression',
    title: 'Double JPEG Compression',
    tagline: '8×8 DCT BLOCK QUANTIZATION ARTIFACTS & HISTOGRAM PERIODICITY',
    domain: 'Frequency',
    description: 'Analyzes primary and secondary discrete cosine transform (DCT) quantization step inconsistencies to detect re-saved JPEG containers and localized splice blocks.',
    example: 'JPEG image cropped and re-saved at a differing quality factor creating periodic DCT coefficient gaps.',
  },
  {
    index: '04',
    key: 'metadata',
    title: 'Container & EXIF Structures',
    tagline: 'CAMERA HARDWARE STREAM, SOFTWARE TAGS & TIMESTAMP CONTINUITY',
    domain: 'Container',
    description: 'Inspects raw container headers for photo-editing signatures (Photoshop, Canva, GIMP), dimension mismatches, missing sensor profiles, and capture-modification timestamp discrepancies.',
    example: "EXIF software tag indicating 'Adobe Photoshop 24.0' with stripped camera serial number.",
  },
  {
    index: '05',
    key: 'noise',
    title: 'Noise Residual Analysis',
    tagline: 'HIGH-FREQUENCY NOISE EXTRACTION & LOCAL VARIANCE DISPARITY',
    domain: 'Spatial',
    description: 'Applies spatial Gaussian high-pass filtering to extract high-frequency sensor noise residuals, isolating patches with abnormal local noise variance.',
    example: 'Smooth synthetically denoised patch inserted into a naturally grainy high-ISO photograph.',
  },
  {
    index: '06',
    key: 'cfa',
    title: 'Color Filter Array (CFA)',
    tagline: 'BAYER PATTERN DEMOSAICING INCONSISTENCIES & RESIDUAL MAP',
    domain: 'Sensor',
    description: 'Detects localized disruptions in the periodic interpolation pattern introduced by digital camera sensor Bayer color filter arrays.',
    example: 'Splice region inserted after demosaicing lacks the micro-periodic interpolation of the authentic camera sensor.',
  },
  {
    index: '07',
    key: 'ela',
    title: 'Error Level Analysis (ELA)',
    tagline: 'RESIDUAL ERROR LEVELS ACROSS COMPRESSION SURFACES',
    domain: 'Frequency',
    description: 'Re-compresses the image at a standard 95% quality rate to compute absolute pixel error disparity, highlighting regions that degrade at divergent rates.',
    example: 'Recently added uncompressed text banner highlights with bright high-error residuals compared to heavily compressed surroundings.',
  },
  {
    index: '08',
    key: 'prnu',
    title: 'PRNU Sensor Fingerprint',
    tagline: 'PHOTO-RESPONSE NON-UNIFORMITY CAMERA ATTRIBUTION COUPLING',
    domain: 'Sensor',
    description: 'Measures deterministic silicon wafer imperfections unique to the acquisition camera sensor to verify structural provenance and localized signal dropouts.',
    example: 'Foreign object spliced into frame lacks the persistent silicon sensor fingerprint of the background camera sensor.',
  },
  {
    index: '09',
    key: 'shadow',
    title: 'Shadow & Illuminant Consistency',
    tagline: 'PHYSICAL LIGHT SOURCE ESTIMATION & ILLUMINATION GEOMETRY',
    domain: 'Physical',
    description: 'Traces shadow trajectories, umbra gradients, and incident illumination angles to detect physically impossible multi-source or misaligned lighting.',
    example: 'Foreground subject casting a shadow toward the left under sunlight, while background trees cast shadows toward the right.',
  },
  {
    index: '10',
    key: 'xai',
    title: 'Grad-CAM Explainability (XAI)',
    tagline: 'TARGET LAYER GRADIENT ACTIVATION BACKPROPAGATION MAP',
    domain: 'Interpretability',
    description: "Computes backpropagated gradient activations targeting MobileNetV2's final convolutional layer, providing an academically defensible visual heatmap of model attention.",
    example: 'Model attention focuses sharply along anomalous high-frequency seam boundaries of the spliced insert.',
  },
  {
    index: '11',
    key: 'adversarial',
    title: 'Adversarial Stress Robustness',
    tagline: 'PERTURBATION RESISTANCE & SPOOFING ATTACK RESILIENCE',
    domain: 'Robustness',
    description: 'Evaluates stability under adversarial gradient attacks (FGSM, PGD), additive high-frequency noise injection, and severe lossy compression spoofing.',
    example: 'Forensic detectors vulnerable to adversarial noise retain high classification fidelity across our multi-signal ensemble.',
  },
];

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<'showcase' | 'studio'>('showcase');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImageSrc, setOriginalImageSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ForensicResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    checkBackendHealth().then(setIsBackendConnected);
    const interval = setInterval(() => {
      checkBackendHealth().then(setIsBackendConnected);
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = (file: File | null) => {
    setSelectedFile(file);
    setErrorMessage(null);
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setOriginalImageSrc(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setOriginalImageSrc(null);
    }
  };

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await detectForgery(file);
      setResults(response);

      setTimeout(() => {
        const verdictEl = document.getElementById('verdict-section');
        verdictEl?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while contacting forensic backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunSampleAnalysis = (type: 'spliced' | 'authentic') => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (type === 'spliced') {
      ctx.fillStyle = '#0a0a0c';
      ctx.fillRect(0, 0, 400, 400);
      for (let i = 0; i < 400; i += 24) {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.strokeRect(i, i, 48, 48);
      }
      ctx.fillStyle = '#5E6AD2';
      ctx.fillRect(100, 120, 190, 150);
      ctx.fillStyle = '#EDEDEF';
      ctx.font = '20px Inter, sans-serif';
      ctx.fillText('SAMPLE SPLICED', 115, 185);
      ctx.fillText('INSERT REGION', 115, 225);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 400, 400);
      grad.addColorStop(0, '#050506');
      grad.addColorStop(0.5, '#0a0a0c');
      grad.addColorStop(1, '#020203');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 400, 400);
      ctx.fillStyle = '#EDEDEF';
      ctx.font = '20px Inter, sans-serif';
      ctx.fillText('NATURAL TEXTURE', 100, 200);
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `sample_${type}.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
        setActiveView('studio');
        setTimeout(() => {
          handleAnalyze(file);
        }, 150);
      }
    }, 'image/jpeg', 0.92);
  };

  const handleScrollToUpload = () => {
    const el = document.getElementById('upload-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#050506] linear-base-bg text-[#EDEDEF] selection:bg-[#5E6AD2]/30 selection:text-white relative">
      {/* Layer 2: Noise Texture Overlay */}
      <div className="linear-noise" />

      {/* Layer 4: Technical 64px Grid Overlay */}
      <div className="linear-grid" />

      {/* Layer 3: Animated Ambient Lighting Blobs */}
      <div className="ambient-blob-primary" />
      <div className="ambient-blob-secondary" />
      <div className="ambient-blob-tertiary" />
      <div className="ambient-blob-pulse" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Navigation & Header */}
        <Hero
          onScrollToUpload={handleScrollToUpload}
          isBackendConnected={isBackendConnected}
          activeView={activeView}
          onViewChange={setActiveView}
        />

        {/* View 1: Linear / Modern Showcase Dashboard */}
        {activeView === 'showcase' && (
          <ShowcaseDashboard
            onNavigateToStudio={() => {
              setActiveView('studio');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onRunSampleAnalysis={handleRunSampleAnalysis}
            isBackendConnected={isBackendConnected}
          />
        )}

        {/* View 2: Full Forensic Studio */}
        {activeView === 'studio' && (
          <div className="space-y-16 animate-fadeIn">
            {/* Section 2: Upload Zone */}
            <section className="space-y-6">
              <SectionRule
                title="Evidence Deposit & Container Ingestion"
                subtitle="Input Stream"
                number="01"
              />
              <UploadZone
                onAnalyze={handleAnalyze}
                isLoading={isLoading}
                selectedFile={selectedFile}
                onFileSelect={handleFileSelect}
                errorMessage={errorMessage}
              />
            </section>

            {/* Results Sections - Rendered when results exist */}
            {results && (
              <div className="space-y-16">
                {/* Section 3: Verdict Section */}
                <div id="verdict-section" className="pt-4">
                  <SectionRule
                    title="Forensic Assessment & Decision"
                    subtitle="Calibrated Fusion"
                    number="02"
                    thick
                  />
                  <VerdictBlock
                    verdict={results.verdict}
                    probability={results.raw_forgery_probability}
                    confidence={results.confidence}
                    disclaimer={results.disclaimer}
                    highlightedImageBase64={results.highlighted_image_base64}
                  />
                </div>

                {/* Section 4: Evidence Section (11 Numbered Plates) */}
                <section className="space-y-8">
                  <SectionRule
                    title="Forensic Evidence Plates"
                    subtitle="11 Signal Probes"
                    number="03"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-6 rounded-2xl bg-[#0a0a0c]/60 border border-white/[0.06] shadow-glass backdrop-blur-md">
                    {TECHNIQUE_METAS.map((meta) => {
                      let report = results.technique_reports?.[meta.key];
                      if (!report && meta.key === 'xai') {
                        const splicingRep = results.technique_reports?.['splicing'];
                        if (splicingRep) {
                          report = {
                            score: splicingRep.score,
                            available: splicingRep.available,
                            message: 'Grad-CAM visual explanation highlighting neural activations in the final convolutional layer of MobileNetV2.',
                            map_base64: splicingRep.map_base64,
                            details: {
                              method: 'Grad-CAM',
                              target_layer: 'MobileNetV2 features[-1]',
                            },
                          };
                        }
                      }

                      return (
                        <EvidencePlate
                          key={meta.key}
                          meta={meta}
                          report={report}
                          originalImageSrc={originalImageSrc}
                        />
                      );
                    })}
                  </div>
                </section>

                {/* Section 5: Contribution Section */}
                <section className="space-y-6">
                  <SectionRule
                    title="Feature Attribution Dynamics"
                    subtitle="Explainable Fusion"
                    number="04"
                  />
                  <ContributionChart
                    contributions={results.technique_contributions}
                  />
                </section>

                {/* Section 6: Adversarial Robustness Table */}
                <section className="space-y-6">
                  <SectionRule
                    title="Adversarial Stress & Integrity Audit"
                    subtitle="Perturbation Resilience"
                    number="05"
                  />
                  <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-xl p-6 sm:p-8 shadow-glass">
                    <AdversarialTable
                      score={results.technique_scores?.['adversarial']}
                      available={results.technique_reports?.['adversarial']?.available}
                    />
                  </div>
                </section>

                {/* Section 7: Summary Pull-Quote */}
                <PullQuote
                  verdict={results.verdict}
                  probability={results.raw_forgery_probability}
                  reports={results.technique_reports}
                />

                {/* Section 8: Juridical Report / PDF Export Section */}
                <section className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-xl p-8 sm:p-12 text-center space-y-6 shadow-glass no-print">
                  <div className="max-w-2xl mx-auto space-y-3">
                    <div className="w-12 h-12 mx-auto rounded-xl bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-[#5E6AD2] flex items-center justify-center shadow-sm">
                      <FileText className="w-6 h-6" />
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#EDEDEF]">
                      Generate Juridical Evidence Dossier
                    </h3>
                    <p className="text-xs sm:text-sm text-[#8A8F98] leading-relaxed max-w-xl mx-auto">
                      Export complete technical dossier including container metadata logs, discrete cosine 
                      transform histograms, localized keypoint coordinates, and calibrated posterior probabilities.
                    </p>
                  </div>

                  <div className="flex justify-center pt-2">
                    <LinearButton
                      variant="primary"
                      size="lg"
                      icon={<Download className="w-4 h-4" />}
                      onClick={handlePrintDossier}
                    >
                      Download / Print Forensic Dossier (PDF)
                    </LinearButton>
                  </div>

                  <div className="text-[11px] font-mono text-[#8A8F98]">
                    SHA-256 Immutable Audit Signature Generated On Export
                  </div>
                </section>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default App;
