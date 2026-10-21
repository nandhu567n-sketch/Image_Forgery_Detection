import React from 'react';
import type { ForensicVerdict, TechniqueReport } from '../types/forensic';
import { Quote } from 'lucide-react';
import { LinearBadge } from './LinearBadge';

interface PullQuoteProps {
  verdict: ForensicVerdict;
  probability: number;
  reports?: Record<string, TechniqueReport>;
}

export const PullQuote: React.FC<PullQuoteProps> = ({
  verdict,
  probability,
}) => {
  let quote = '';
  if (verdict === 'Likely Forged') {
    quote =
      'Multi-domain forensic examination demonstrates congruent high-magnitude anomalies across localized boundary representations and transform-domain quantization structures, indicating a high likelihood of digital manipulation.';
  } else if (verdict === 'Suspicious') {
    quote =
      'Discrepant noise variance and localized neural activation gradients suggest synthetic or spliced components, though statistical boundaries require corroboration against uncompressed camera source media.';
  } else if (verdict === 'Likely Authentic') {
    quote =
      'Cross-examination across frequency-domain DCT distributions and spatial error levels indicates standard compression behavior with minimal localized variance disparities.';
  } else {
    quote =
      'Empirical verification reveals uniform sensor noise distribution, congruent DCT coefficient histograms, and unperturbed compression signatures consistent with pristine digital acquisition.';
  }

  return (
    <div className="w-full my-12 rounded-2xl bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/[0.08] py-10 px-6 sm:px-12 text-center shadow-glass relative overflow-hidden">
      {/* Top Edge Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-5">
        <div className="w-10 h-10 mx-auto rounded-xl bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-[#5E6AD2] flex items-center justify-center shadow-sm">
          <Quote className="w-5 h-5 rotate-180" />
        </div>

        <blockquote className="font-sans font-normal text-lg md:text-2xl text-[#EDEDEF] leading-relaxed max-w-3xl mx-auto">
          "{quote}"
        </blockquote>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 text-xs font-mono">
          <LinearBadge variant="accent">
            Assessment: {verdict}
          </LinearBadge>
          <LinearBadge variant="neutral">
            P(Forg) = {probability.toFixed(4)}
          </LinearBadge>
          <span className="text-[#8A8F98]">
            // Multimodal Cross-Verification
          </span>
        </div>
      </div>
    </div>
  );
};
