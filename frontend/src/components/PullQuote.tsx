import React from 'react';
import type { ForensicVerdict, TechniqueReport } from '../types/forensic';
import { Quote } from 'lucide-react';

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
    <div className="w-full my-12 rounded-[2rem] bg-[#F0EBE5]/50 border border-[#DED8CF] py-10 px-6 sm:px-12 text-center shadow-soft relative overflow-hidden">
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="w-10 h-10 mx-auto rounded-full bg-[#5D7052]/10 text-[#5D7052] flex items-center justify-center">
          <Quote className="w-5 h-5 rotate-180" />
        </div>

        <blockquote className="font-serif italic text-2xl md:text-3xl text-[#2C2C24] leading-relaxed max-w-3xl mx-auto">
          "{quote}"
        </blockquote>

        <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-semibold text-[#78786C]">
          <span className="px-3 py-1 rounded-full bg-white border border-[#DED8CF] text-[#2C2C24]">
            Assessment: <strong>{verdict}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-white border border-[#DED8CF] text-[#5D7052]">
            P(Forg) = {probability.toFixed(4)}
          </span>
          <span className="text-[#78786C]">
            // Multimodal Cross-Verification
          </span>
        </div>
      </div>
    </div>
  );
};
