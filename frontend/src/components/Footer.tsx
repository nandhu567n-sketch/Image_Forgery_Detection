import React from 'react';
import { Cpu, ShieldCheck, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-24 border-t border-white/[0.08] bg-[#020203] pt-14 pb-16 text-xs text-[#8A8F98]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/[0.06]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-[#5E6AD2] flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-semibold text-base text-[#EDEDEF] block">
                VERITAS Forensics & Machine Intelligence
              </span>
              <span className="text-[11px] text-[#8A8F98] font-mono">
                Digital Media Authenticity Research Group
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-mono">
            <span className="px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#EDEDEF]">
              Linear System v2.0
            </span>
            <span className="px-3 py-1 rounded-full bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 text-[#6872D9]">
              CASIA 2.0 Benchmark
            </span>
          </div>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 shadow-sm">
            <div className="flex items-center space-x-2 text-[#EDEDEF] font-semibold text-sm">
              <Terminal className="w-4 h-4 text-[#5E6AD2]" />
              <span>Methodological Foundations</span>
            </div>
            <p className="text-[#8A8F98]">
              Synthesizes ORB keypoint geometric clustering, 8×8 DCT quantization periodicity, 
              Gaussian spatial noise residuals, and fine-tuned MobileNetV2 transfer learning representations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 shadow-sm">
            <div className="flex items-center space-x-2 text-[#EDEDEF] font-semibold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#5E6AD2]" />
              <span>Linear / Modern Design System</span>
            </div>
            <p className="text-[#8A8F98]">
              Engineered with deep near-blacks (#050506), saturated indigo ambient illumination (#5E6AD2), 
              mouse-tracking spotlights, multi-layer shadows, and asymmetric bento grids.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] space-y-2 shadow-sm">
            <span className="font-semibold text-sm text-[#EDEDEF] block">
              Juridical Scope
            </span>
            <p className="text-[#8A8F98] italic">
              "Result is a statistical model assessment across multiple forensic signals, not a definitive legal determination. 
              Always corroborate findings through primary device chain of custody."
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-white/[0.06] flex flex-col sm:flex-row justify-between items-center text-[11px] font-mono text-[#8A8F98] gap-2">
          <span>© 2026 VERITAS FORENSICS GROUP. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center space-x-1">
            <span>Built with precision for media integrity & scientific truth.</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
