import React from 'react';
import { ArrowDown, ShieldCheck, Sparkles, Feather } from 'lucide-react';

interface HeroProps {
  onScrollToUpload: () => void;
  isBackendConnected: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToUpload,
  isBackendConnected,
}) => {
  return (
    <header className="w-full pt-4 pb-12 relative">
      {/* Sticky Floating Glassmorphic Pill Navigation */}
      <div className="sticky top-4 z-30 w-full max-w-4xl mx-auto mb-10">
        <div className="bg-white/80 backdrop-blur-md border border-[#DED8CF]/70 rounded-full px-5 py-2.5 shadow-soft flex items-center justify-between transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#5D7052] text-[#F3F4F1] flex items-center justify-center shadow-sm">
              <Feather className="w-4 h-4" />
            </div>
            <span className="font-serif font-bold text-base tracking-tight text-[#2C2C24]">
              VERITAS <span className="font-sans font-normal text-xs text-[#78786C] hidden sm:inline">// Image Forensics</span>
            </span>
          </div>

          <div className="flex items-center space-x-4 text-xs font-semibold">
            <div className="flex items-center space-x-2 bg-[#F0EBE5]/80 px-3 py-1 rounded-full text-[#4A4A40]">
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  isBackendConnected ? 'bg-[#5D7052] shadow-[0_0_8px_rgba(93,112,82,0.6)]' : 'bg-[#C18C5D]'
                }`}
              />
              <span>{isBackendConnected ? 'Engine Active' : 'Connecting...'}</span>
            </div>
            <span className="text-[#78786C] hidden md:inline text-[11px]">
              CASIA 2.0 Protocol
            </span>
          </div>
        </div>
      </div>

      {/* Ambient Organic Background Blobs */}
      <div className="absolute top-10 right-4 sm:right-16 w-80 h-80 bg-[#5D7052]/12 rounded-blob-1 blur-3xl pointer-events-none -z-10 animate-natural-float" />
      <div className="absolute top-44 left-0 sm:left-12 w-96 h-88 bg-[#C18C5D]/10 rounded-blob-2 blur-3xl pointer-events-none -z-10" />

      {/* Main Narrative Display */}
      <div className="max-w-4xl mx-auto text-center space-y-6 pt-6">
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#E6DCCD]/40 border border-[#DED8CF]/60 text-xs font-bold text-[#5D7052] uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Handcrafted Forensic Intelligence</span>
        </div>

        <h1 className="font-serif text-5xl sm:text-7xl md:text-8xl font-bold tracking-tight text-[#2C2C24] leading-[1.08]">
          Grounded forensic <br />
          <span className="italic font-normal text-[#5D7052] selection:bg-[#5D7052]/20">
            verification.
          </span>
        </h1>

        <p className="font-body text-base sm:text-lg text-[#4A4A40] max-w-2xl mx-auto leading-relaxed">
          An authentic, multi-domain digital image forensics suite. We inspect physical lighting, 
          quantization grain, sensor noise, and convolutional features to uncover manipulation 
          with calm, explainable transparency.
        </p>

        {/* Action Button & Trust Marks */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={onScrollToUpload}
            className="min-h-[48px] px-8 py-3.5 bg-[#5D7052] text-[#F3F4F1] font-bold text-sm rounded-full shadow-soft hover:shadow-float hover:scale-105 active:scale-95 transition-all duration-300 flex items-center space-x-2.5 cursor-pointer"
          >
            <span>Deposit Image Evidence</span>
            <ArrowDown className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-xs font-semibold text-[#78786C] px-3 py-1">
            <ShieldCheck className="w-4 h-4 text-[#5D7052]" />
            <span>11 Physical & Neural Signal Probes</span>
          </div>
        </div>
      </div>

      {/* Gentle Wave Divider */}
      <div className="w-full max-w-5xl mx-auto mt-14 pt-2">
        <svg
          className="w-full h-4 text-[#DED8CF]/70"
          viewBox="0 0 1200 24"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 12 Q 300 24 600 12 T 1200 12"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            fill="none"
          />
        </svg>
      </div>
    </header>
  );
};
