import React from 'react';
import type { ForensicVerdict } from '../types/forensic';
import { Compass, AlertTriangle, CheckCircle2 } from 'lucide-react';

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

  return (
    <section className="w-full bg-[#FEFEFA] text-[#2C2C24] p-8 sm:p-12 md:p-14 rounded-[2.5rem] border border-[#DED8CF] shadow-float relative overflow-hidden transition-all duration-500">
      {/* Ambient Organic Warm Washes */}
      <div
        className={`absolute -top-16 -right-16 w-80 h-80 rounded-blob-1 blur-3xl pointer-events-none opacity-40 ${
          isSuspicious ? 'bg-[#C18C5D]/20' : 'bg-[#5D7052]/20'
        }`}
      />
      <div className="absolute -bottom-16 -left-16 w-80 h-80 rounded-blob-2 blur-3xl pointer-events-none opacity-30 bg-[#E6DCCD]" />

      {/* Header Tag */}
      <div className="flex flex-wrap items-center justify-between pb-6 border-b border-[#DED8CF]/70 gap-2 relative z-10">
        <div className="flex items-center space-x-2.5">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isSuspicious
                ? 'bg-[#C18C5D]/15 text-[#C18C5D]'
                : 'bg-[#5D7052]/15 text-[#5D7052]'
            }`}
          >
            {isSuspicious ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5" />
            )}
          </div>
          <span className="font-serif font-bold text-xs tracking-wider uppercase text-[#78786C]">
            Aggregated Decision Engine
          </span>
        </div>

        <span className="px-3 py-1 rounded-full bg-[#F0EBE5] text-xs font-semibold text-[#4A4A40]">
          Logistic Evidence Fusion // CASIA 2.0
        </span>
      </div>

      <div className="pt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        {/* Left Column: Verdict Heading & Metrics */}
        <div className="lg:col-span-8 space-y-6">
          <div className="space-y-1.5">
            <span className="text-xs font-bold tracking-wider text-[#78786C] uppercase">
              Forensic Evaluation Summary:
            </span>
            <h1
              className={`font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight leading-none ${
                verdict === 'Authentic' || verdict === 'Likely Authentic'
                  ? 'text-[#5D7052]'
                  : 'text-[#C18C5D]'
              }`}
            >
              {verdict}
            </h1>
          </div>

          {/* Metric Chips */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-[#F0EBE5]/70 border border-[#DED8CF]/60 shadow-sm">
              <span className="text-xs font-semibold text-[#78786C] uppercase block mb-1">
                Posterior Probability
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C24]">
                P = {probability.toFixed(4)}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0EBE5]/70 border border-[#DED8CF]/60 shadow-sm">
              <span className="text-xs font-semibold text-[#78786C] uppercase block mb-1">
                Ensemble Confidence
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C24]">
                {confPercent}%
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#F0EBE5]/70 border border-[#DED8CF]/60 shadow-sm">
              <span className="text-xs font-semibold text-[#78786C] uppercase block mb-1">
                Signal Cohesion
              </span>
              <span className="text-2xl sm:text-3xl font-serif font-bold text-[#2C2C24]">
                {isSuspicious ? 'Anomalous' : 'Congruent'}
              </span>
            </div>
          </div>

          {/* Calibrated Continuum Track */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs font-bold text-[#78786C]">
              <span>0.00 Authentic</span>
              <span>0.25 Likely Auth</span>
              <span>0.50 Suspicious</span>
              <span>0.75 Likely Forged</span>
              <span>1.00</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#E6DCCD]/60 border border-[#DED8CF] p-0.5 relative overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isSuspicious
                    ? 'bg-gradient-to-r from-[#C18C5D] to-[#A85448]'
                    : 'bg-gradient-to-r from-[#768B6A] to-[#5D7052]'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, probability * 100))}%` }}
              />
            </div>
          </div>

          {/* Mandatory Academic Disclaimer */}
          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-[#F0EBE5]/60 border-l-4 border-[#C18C5D] text-xs sm:text-sm text-[#4A4A40] italic leading-relaxed">
              "{disclaimer}"
            </div>
          </div>
        </div>

        {/* Right Column: Spatial Heatmap Card */}
        {highlightedImageBase64 && (
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-[#5D7052] uppercase tracking-wider">
              <Compass className="w-4 h-4" />
              <span>Multi-Signal Localization</span>
            </div>

            <div className="w-full max-w-xs aspect-square rounded-2xl border border-[#DED8CF] bg-white p-2.5 shadow-soft flex items-center justify-center overflow-hidden">
              <img
                src={`data:image/png;base64,${highlightedImageBase64}`}
                alt="Fused Spatial Localization Map"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>

            <p className="text-[11px] text-[#78786C] text-center max-w-xs">
              Spatially localized synthesis across salient neural activations, noise residuals, and error boundaries.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
