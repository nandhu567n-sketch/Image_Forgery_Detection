import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Cpu,
  Shield,
  Sparkles,
  Zap,
  Sliders,
  Grid,
  ArrowRight,
} from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';
import { LinearButton } from './LinearButton';
import { LinearBadge } from './LinearBadge';

interface ShowcaseDashboardProps {
  onNavigateToStudio: () => void;
  onRunSampleAnalysis: (type: 'spliced' | 'authentic') => void;
  isBackendConnected: boolean;
}

export const ShowcaseDashboard: React.FC<ShowcaseDashboardProps> = ({
  onNavigateToStudio,
  onRunSampleAnalysis,
  isBackendConnected,
}) => {
  const [activeProbeTab, setActiveProbeTab] = useState<'xai' | 'dct' | 'orb' | 'prnu'>('xai');
  const [interactiveInputVal, setInteractiveInputVal] = useState('demo_sensor_capture_casia2.jpg');
  const [spotlightSize, setSpotlightSize] = useState(300);

  const probeData = {
    xai: {
      name: 'Grad-CAM Attention Heatmap',
      layer: 'MobileNetV2 features[-1]',
      status: 'Calibrated',
      latency: '24ms',
      metric: '0.984 AUC',
      description: 'Backpropagates gradient activations from the final 1280-dim feature map to pinpoint synthetic composite seam boundaries.',
    },
    dct: {
      name: '8×8 DCT Quantization Grids',
      layer: 'Frequency Spectrum / Periodic Blocks',
      status: 'Active',
      latency: '18ms',
      metric: 'Q-Factor 92%',
      description: 'Isolates primary and secondary JPEG compression steps to uncover localized double-compression discrepancies.',
    },
    orb: {
      name: 'ORB / AKAZE Geometric Verification',
      layer: 'Spatial Keypoint Inlier Graphs',
      status: 'Active',
      latency: '36ms',
      metric: '142 Clusters',
      description: 'Extracts scale-invariant feature clusters and validates affine homography matrices to identify cloned photographic regions.',
    },
    prnu: {
      name: 'Sensor PRNU Wafer Fingerprint',
      layer: 'Physical Silicon Imperfections',
      status: 'Calibrated',
      latency: '42ms',
      metric: 'Noise σ = 0.04',
      description: 'Computes deterministic sensor photo-response non-uniformity unique to the camera hardware to verify provenance.',
    },
  };

  return (
    <div className="w-full space-y-20 pb-24">
      {/* 1. Hero Presentation Section */}
      <section className="relative pt-8 pb-12 text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#5E6AD2]" />
          <span className="text-xs font-mono tracking-widest text-[#EDEDEF] uppercase">
            Linear / Modern System Architecture
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#5E6AD2] animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.03em] leading-[1.08] bg-gradient-to-b from-white via-white/95 to-white/70 bg-clip-text text-transparent">
          The new standard in <br />
          <span className="shimmer-text">forensic precision.</span>
        </h1>

        <p className="text-base sm:text-lg text-[#8A8F98] max-w-2xl mx-auto leading-relaxed font-normal">
          Engineered with layered ambient illumination, mouse-responsive spotlights, and mathematical bento grids.
          Every surface exists in calibrated three-dimensional space.
        </p>

        {/* Hero Quick Controls */}
        <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
          <LinearButton
            variant="primary"
            size="lg"
            icon={<ArrowRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={onNavigateToStudio}
          >
            Launch Forensic Studio
          </LinearButton>

          <LinearButton
            variant="secondary"
            size="lg"
            icon={<Zap className="w-4 h-4 text-[#5E6AD2]" />}
            onClick={() => onRunSampleAnalysis('spliced')}
          >
            Test Spliced Ingestion
          </LinearButton>
        </div>

        {/* Micro-Telemetry Badge Row */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <LinearBadge variant="accent" dot>
            11 Signal Probes
          </LinearBadge>
          <LinearBadge variant={isBackendConnected ? 'success' : 'warning'} dot>
            {isBackendConnected ? 'Inference Engine Active' : 'Connecting to Backend'}
          </LinearBadge>
          <LinearBadge variant="neutral">
            CASIA 2.0 Benchmark
          </LinearBadge>
        </div>
      </section>

      {/* 2. Asymmetric Bento Grid Section (6-Column Base Grid) */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.06] pb-4 gap-2">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2] mb-1">
              Architecture // 01
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#EDEDEF]">
              Multi-Domain Bento Engine
            </h2>
          </div>
          <p className="text-xs text-[#8A8F98] max-w-md">
            Asymmetric 6-column bento layout featuring mouse-tracking spotlights, micro-metric meters, and live probe switching.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-5 auto-rows-auto">
          {/* Hero Bento Card (Col span 4, Row span 2) */}
          <SpotlightCard
            variant="default"
            spotlightSize={spotlightSize}
            className="lg:col-span-4 p-6 sm:p-8 flex flex-col justify-between space-y-6"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 flex items-center justify-center text-[#5E6AD2]">
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[#EDEDEF] tracking-tight">
                      Neural Inference & Grad-CAM Backpropagation
                    </h3>
                    <p className="text-xs text-[#8A8F98] font-mono mt-0.5">
                      Core Vision Model: MobileNetV2 // Features[-1]
                    </p>
                  </div>
                </div>

                <LinearBadge variant="accent" size="sm">
                  Live Probe
                </LinearBadge>
              </div>

              <p className="text-sm text-[#8A8F98] leading-relaxed max-w-2xl">
                The neural backbone computes cross-entropy attention maps across target feature boundaries.
                Spliced patches yield anomalous gradient concentrations compared to homogeneous sensor backgrounds.
              </p>

              {/* Probe Selector Sub-Navigation */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.06]">
                {(['xai', 'dct', 'orb', 'prnu'] as const).map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setActiveProbeTab(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 cursor-pointer ${
                      activeProbeTab === key
                        ? 'bg-[#5E6AD2] text-white shadow-cta font-semibold'
                        : 'bg-white/[0.04] text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] border border-white/[0.06]'
                    }`}
                  >
                    {key.toUpperCase()} Probe
                  </button>
                ))}
              </div>

              {/* Active Tab Card */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#EDEDEF] font-semibold">{probeData[activeProbeTab].name}</span>
                  <span className="text-[#5E6AD2]">{probeData[activeProbeTab].metric}</span>
                </div>
                <p className="text-xs text-[#8A8F98] leading-relaxed">
                  {probeData[activeProbeTab].description}
                </p>
                <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-[#8A8F98]">
                  <span>Target: {probeData[activeProbeTab].layer}</span>
                  <span className="text-emerald-400">Latency: {probeData[activeProbeTab].latency}</span>
                </div>
              </div>
            </div>

            {/* Micro Graph / Telemetry Grid */}
            <div className="pt-4 border-t border-white/[0.06] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[#8A8F98] text-[10px]">AUROC Fidelity</div>
                <div className="text-base font-semibold text-[#EDEDEF] mt-1">98.42%</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[#8A8F98] text-[10px]">EER Threshold</div>
                <div className="text-base font-semibold text-[#EDEDEF] mt-1">0.041</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[#8A8F98] text-[10px]">Inference Time</div>
                <div className="text-base font-semibold text-[#EDEDEF] mt-1">142ms</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <div className="text-[#8A8F98] text-[10px]">Signal Entropy</div>
                <div className="text-base font-semibold text-[#EDEDEF] mt-1">1.84 nats</div>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 2: Spatial Keypoint Replication (Col span 2) */}
          <SpotlightCard
            variant="default"
            spotlightSize={spotlightSize}
            className="lg:col-span-2 p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#EDEDEF]">
                  <Layers className="w-4 h-4 text-[#5E6AD2]" />
                </div>
                <span className="text-[11px] font-mono text-[#8A8F98]">ORB/AKAZE</span>
              </div>
              <h3 className="text-lg font-semibold text-[#EDEDEF] tracking-tight">
                Copy-Move Spatial Clones
              </h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed">
                RANSAC geometric inliers track multi-point displacement vectors to locate duplicated textures.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] font-mono text-[#8A8F98]">
                <span>Inlier Cohesion</span>
                <span className="text-[#5E6AD2] font-semibold">96.8%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="w-[96%] h-full bg-[#5E6AD2] rounded-full" />
              </div>
            </div>
          </SpotlightCard>

          {/* Card 3: Sensor Wafer PRNU (Col span 2) */}
          <SpotlightCard
            variant="default"
            spotlightSize={spotlightSize}
            className="lg:col-span-2 p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#EDEDEF]">
                  <Cpu className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-[11px] font-mono text-emerald-400">Sensor Wafer</span>
              </div>
              <h3 className="text-lg font-semibold text-[#EDEDEF] tracking-tight">
                PRNU Silicon Imperfection
              </h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed">
                Photo-response non-uniformity fingerprints isolate donor patches inserted from secondary cameras.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between text-xs font-mono">
              <span className="text-[#8A8F98]">Correlation Peak</span>
              <span className="text-[#EDEDEF] font-semibold">0.842 PCE</span>
            </div>
          </SpotlightCard>

          {/* Card 4: Adversarial Resilience Matrix (Col span 3) */}
          <SpotlightCard
            variant="default"
            spotlightSize={spotlightSize}
            className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#EDEDEF]">
                  <Shield className="w-4 h-4 text-[#5E6AD2]" />
                </div>
                <LinearBadge variant="success" size="sm">
                  Resilient
                </LinearBadge>
              </div>

              <h3 className="text-xl font-semibold text-[#EDEDEF] tracking-tight">
                Adversarial Perturbation Resilience
              </h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed">
                Stress-tested against FGSM (Fast Gradient Sign Method) and PGD (Projected Gradient Descent) attack vectors.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[#8A8F98] text-[10px]">FGSM ε=0.03</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1">92% Stability</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[#8A8F98] text-[10px]">PGD 3-Step</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1">89% Stability</div>
              </div>
            </div>
          </SpotlightCard>

          {/* Card 5: DCT Block Quantization (Col span 3) */}
          <SpotlightCard
            variant="default"
            spotlightSize={spotlightSize}
            className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#EDEDEF]">
                  <Grid className="w-4 h-4 text-indigo-400" />
                </div>
                <span className="text-[11px] font-mono text-[#8A8F98]">DCT Frequency</span>
              </div>

              <h3 className="text-xl font-semibold text-[#EDEDEF] tracking-tight">
                8×8 DCT Quantization Grids
              </h3>
              <p className="text-xs text-[#8A8F98] leading-relaxed">
                Discrete Cosine Transform histogram periodicity exposes localized compression history discrepancies.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-[11px] font-mono text-[#8A8F98]">
                <span>Histogram Periodicity Check</span>
                <span className="text-emerald-400 font-semibold">Clean (Single Pass)</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                <div className="w-[84%] h-full bg-indigo-500 rounded-full" />
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* 3. Interactive Design System Component Playground & Token Inspector */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-white/[0.06] pb-4 gap-2">
          <div>
            <div className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2] mb-1">
              Design System Tokens & Components // 02
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#EDEDEF]">
              Linear Interactive Component Sandbox
            </h2>
          </div>
          <p className="text-xs text-[#8A8F98] max-w-md">
            Test buttons, mouse spotlights, form inputs, and color tokens built strictly to the Linear / Modern standard.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Playground Part 1: Button Variants & Micro-Interactions */}
          <SpotlightCard variant="glass" className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#5E6AD2]" />
                <span>Button Hierarchy & Shine Effect</span>
              </h3>
              <p className="text-xs text-[#8A8F98] mt-1">
                Multi-layer shadows with accent glow for Primary, subtle glass inset for Secondary, and muted text for Ghost.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <LinearButton variant="primary">Primary Button</LinearButton>
              <LinearButton variant="secondary">Secondary Button</LinearButton>
              <LinearButton variant="ghost">Ghost Button</LinearButton>
              <LinearButton variant="danger">Danger Button</LinearButton>
            </div>

            {/* Sizes */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06]">
              <div className="text-xs font-mono text-[#8A8F98]">Component Sizes:</div>
              <div className="flex flex-wrap items-center gap-3">
                <LinearButton variant="primary" size="sm">Small (32px)</LinearButton>
                <LinearButton variant="primary" size="md">Medium (40px)</LinearButton>
                <LinearButton variant="primary" size="lg">Large (48px)</LinearButton>
              </div>
            </div>

            {/* Inputs & Focus Rings */}
            <div className="space-y-3 pt-3 border-t border-white/[0.06]">
              <label className="text-xs font-mono text-[#8A8F98] block">
                Linear Form Input with Accent Focus Ring:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={interactiveInputVal}
                  onChange={(e) => setInteractiveInputVal(e.target.value)}
                  className="w-full bg-[#0F0F12] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-[#5E6AD2] focus:ring-2 focus:ring-[#5E6AD2]/50 focus:ring-offset-2 focus:ring-offset-[#050506] transition-all duration-200 outline-none font-mono"
                  placeholder="Enter sample filename..."
                />
                <LinearButton variant="secondary" onClick={() => setInteractiveInputVal('')}>
                  Clear
                </LinearButton>
              </div>
            </div>
          </SpotlightCard>

          {/* Playground Part 2: Color Strategy & Spotlight Controls */}
          <SpotlightCard variant="glass" className="p-6 sm:p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#EDEDEF] tracking-tight flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#5E6AD2]" />
                <span>Spotlight Parameters & Core Color Tokens</span>
              </h3>
              <p className="text-xs text-[#8A8F98] mt-1">
                Deep near-blacks with saturated indigo accents and responsive cursor spotlighting.
              </p>
            </div>

            {/* Spotlight Radius Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#8A8F98]">Spotlight Diameter</span>
                <span className="text-[#5E6AD2] font-semibold">{spotlightSize}px</span>
              </div>
              <input
                type="range"
                min="150"
                max="500"
                value={spotlightSize}
                onChange={(e) => setSpotlightSize(Number(e.target.value))}
                className="w-full accent-[#5E6AD2] cursor-pointer"
              />
              <span className="text-[11px] text-[#8A8F98] block">
                Hover over any card on this page to observe the radial glow adapt to this size.
              </span>
            </div>

            {/* Color Tokens Matrix */}
            <div className="space-y-2 pt-3 border-t border-white/[0.06]">
              <div className="text-xs font-mono text-[#8A8F98]">Core Color Palette:</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
                <div className="p-2.5 rounded-lg bg-[#050506] border border-white/[0.08]">
                  <div className="w-4 h-4 rounded bg-[#050506] border border-white/20 mb-1" />
                  <div className="text-[#EDEDEF] font-semibold">#050506</div>
                  <div className="text-[#8A8F98] text-[9px]">background</div>
                </div>

                <div className="p-2.5 rounded-lg bg-[#0a0a0c] border border-white/[0.08]">
                  <div className="w-4 h-4 rounded bg-[#0a0a0c] border border-white/20 mb-1" />
                  <div className="text-[#EDEDEF] font-semibold">#0a0a0c</div>
                  <div className="text-[#8A8F98] text-[9px]">elevated</div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <div className="w-4 h-4 rounded bg-[#5E6AD2] mb-1" />
                  <div className="text-[#EDEDEF] font-semibold">#5E6AD2</div>
                  <div className="text-[#8A8F98] text-[9px]">accent</div>
                </div>

                <div className="p-2.5 rounded-lg bg-white/[0.05] border border-white/[0.08]">
                  <div className="w-4 h-4 rounded bg-[#EDEDEF] mb-1" />
                  <div className="text-[#EDEDEF] font-semibold">#EDEDEF</div>
                  <div className="text-[#8A8F98] text-[9px]">foreground</div>
                </div>
              </div>
            </div>
          </SpotlightCard>
        </div>
      </section>

      {/* 4. Action Banner to Studio */}
      <section className="relative rounded-2xl border border-white/[0.08] bg-gradient-to-r from-white/[0.04] via-white/[0.02] to-transparent p-8 sm:p-12 overflow-hidden shadow-glass">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-[#5E6AD2]/10 to-transparent pointer-events-none" />
        <div className="max-w-2xl space-y-4 relative z-10">
          <LinearBadge variant="accent">
            Live Analysis Flow
          </LinearBadge>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-[#EDEDEF]">
            Ready to inspect authentic or suspect media?
          </h2>
          <p className="text-sm text-[#8A8F98] leading-relaxed">
            Deposit any JPEG or PNG photograph into the Forensic Studio to evaluate all 11 physical,
            transform-domain, and convolutional signal probes with full Grad-CAM heatmaps.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <LinearButton
              variant="primary"
              size="lg"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              onClick={onNavigateToStudio}
            >
              Open Forensic Studio
            </LinearButton>
            <LinearButton
              variant="secondary"
              size="lg"
              onClick={() => onRunSampleAnalysis('authentic')}
            >
              Run Pristine Baseline Sample
            </LinearButton>
          </div>
        </div>
      </section>
    </div>
  );
};
