import React from 'react';
import { Feather, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full mt-24 border-t border-[#DED8CF] bg-[#F0EBE5]/40 pt-14 pb-16 text-xs text-[#78786C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-[#DED8CF]/70">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#5D7052] text-[#F3F4F1] flex items-center justify-center shadow-sm">
              <Feather className="w-4 h-4" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#2C2C24] block">
                VERITAS Forensics & Machine Intelligence
              </span>
              <span className="text-[11px] text-[#78786C]">
                Digital Media Authenticity Research Group
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs font-semibold">
            <span className="px-3 py-1 rounded-full bg-white border border-[#DED8CF] text-[#4A4A40]">
              Version 1.0.0
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-[#DED8CF] text-[#5D7052]">
              CASIA 2.0 Benchmark
            </span>
          </div>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs leading-relaxed">
          <div className="p-5 rounded-2xl bg-white/70 border border-[#DED8CF]/60 space-y-2 shadow-sm">
            <span className="font-serif font-bold text-sm text-[#2C2C24] block">
              Methodological Foundations
            </span>
            <p className="text-[#4A4A40]">
              Synthesizes ORB keypoint geometric clustering, 8×8 DCT quantization periodicity, 
              Gaussian spatial noise residuals, and fine-tuned MobileNetV2 transfer learning representations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 border border-[#DED8CF]/60 space-y-2 shadow-sm">
            <span className="font-serif font-bold text-sm text-[#2C2C24] block">
              Organic Design System
            </span>
            <p className="text-[#4A4A40]">
              Built upon organic wabi-sabi principles: earth-drawn tones (moss, terracotta, rice paper), 
              Fraunces & Nunito typography, diffused natural shadows, and tactility.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/70 border border-[#DED8CF]/60 space-y-2 shadow-sm">
            <span className="font-serif font-bold text-sm text-[#2C2C24] block">
              Juridical Scope
            </span>
            <p className="text-[#4A4A40] italic">
              "Result is a statistical model assessment across multiple forensic signals, not a definitive legal determination. 
              Always corroborate findings through primary device chain of custody."
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-[#DED8CF]/60 flex flex-col sm:flex-row justify-between items-center text-[11px] text-[#78786C] gap-2">
          <span>© 2026 VERITAS FORENSICS GROUP. ALL RIGHTS RESERVED.</span>
          <span className="flex items-center space-x-1">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-[#C18C5D] fill-current inline mx-0.5" />
            <span>for academic integrity & human connection.</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
