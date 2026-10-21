import React from 'react';
import type { ForensicVerdict } from '../types/forensic';
import { Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LinearBadge } from './LinearBadge';

interface VerdictBlockProps {
  verdict: ForensicVerdict;
  probability: number;
  confidence: number;
  disclaimer: string;
  highlightedImageBase64?: string;
}

export const VerdictBlock: React.FC<VerdictBlockProps> = ({
  verdict,
  probability,
  confidence,
  disclaimer,
  highlightedImageBase64,
}) => {
  const confPercent = (confidence * 100).toFixed(1);
  const isSuspicious = probability >= 0.5;

  const verdictColorClass =
    verdict === 'Authentic' || verdict === 'Likely Authentic'
      ? 'text-emerald-400'
      : isSuspicious
      ? 'text-rose-400'
      : 'text-[#5E6AD2]';

  return (
    <section className="w-full bg-[#0a0a0c]/90 backdrop-blur-xl text-[#EDEDEF] p-8 sm:p-12 rounded-2xl border border-white/[0.08] shadow-glass relative overflow-hidden transition-all duration-500">
      {/* Top Edge Inner Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Ambient Radial Accent Glows */}
      <div
        className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] pointer-events-none opacity-20 ${
          isSuspicious ? 'bg-rose-500' : 'bg-emerald-500'
        }`}
      />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none opacity-15 bg-[#5E6AD2]" />

      {/* Header Tag */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-white/[0.06] gap-2 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center border ${
              isSuspicious
                ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            {isSuspicious ? (
              <AlertTriangle className="w-4 h-4" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
          </div>
          <span className="font-mono text-xs uppercase tracking-widest text-[#8A8F98]">
            Aggregated Decision Engine // Calibrated Fusion
          </span>
        </div>

        <LinearBadge variant="accent">
          Logistic Evidence Fusion // CASIA 2.0
        </LinearBadge>
      </div>

      <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Verdict Heading & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-[#8A8F98]">
              Forensic Evaluation Summary:
            </span>
            <h1
              className={`font-sans text-5xl sm:text-7xl md:text-8xl font-semibold tracking-[-0.03em] leading-none ${verdictColorClass}`}
            >
              {verdict}
            </h1>
          </div>

          {/* Metric Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-inner">
              <span className="text-[11px] font-mono text-[#8A8F98] uppercase block mb-1">
                Posterior Probability
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-semibold text-[#EDEDEF]">
                P = {probability.toFixed(4)}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-inner">
              <span className="text-[11px] font-mono text-[#8A8F98] uppercase block mb-1">
                Ensemble Confidence
              </span>
              <span className="text-2xl sm:text-3xl font-mono font-semibold text-[#EDEDEF]">
                {confPercent}%
              </span>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] shadow-inner">
              <span className="text-[11px] font-mono text-[#8A8F98] uppercase block mb-1">
                Signal Cohesion
              </span>
              <span className={`text-2xl sm:text-3xl font-mono font-semibold ${
                isSuspicious ? 'text-rose-400' : 'text-emerald-400'
              }`}>
                {isSuspicious ? 'Anomalous' : 'Congruent'}
              </span>
            </div>
          </div>

          {/* Calibrated Continuum Track */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-mono text-[#8A8F98]">
              <span>0.00 Authentic</span>
              <span>0.25 Likely Auth</span>
              <span>0.50 Suspicious</span>
              <span>0.75 Likely Forged</span>
              <span>1.00</span>
            </div>
            <div className="w-full h-3 rounded-full bg-white/[0.05] border border-white/[0.08] p-0.5 relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSuspicious
                    ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                    : 'bg-gradient-to-r from-emerald-500 to-[#5E6AD2]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, probability * 100))}%` }}
              />
            </div>
          </div>

          {/* Mandatory Academic Disclaimer */}
          <div className="pt-2">
            <div className="p-4 rounded-xl bg-white/[0.03] border-l-2 border-[#5E6AD2] text-xs sm:text-sm text-[#8A8F98] italic leading-relaxed font-sans">
              "{disclaimer}"
            </div>
          </div>
        </div>

        {/* Right Column: Spatial Heatmap Card */}
        {highlightedImageBase64 && (
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-mono text-[#5E6AD2] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Multi-Signal Localization Map</span>
            </div>

            <div className="w-full max-w-xs aspect-square rounded-xl border border-white/[0.08] bg-[#020203] p-2.5 shadow-glass flex items-center justify-center overflow-hidden">
              <img
                src={`data:image/png;base64,${highlightedImageBase64}`}
                alt="Fused Spatial Localization Map"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>

            <p className="text-[11px] text-[#8A8F98] text-center max-w-xs font-mono">
              Spatially localized synthesis across salient neural activations, noise residuals, and error boundaries.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
