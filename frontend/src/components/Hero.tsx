import React, { useState } from 'react';
import { ArrowDown, ShieldCheck, Sparkles, Cpu, Menu, X, LayoutDashboard, FileSearch } from 'lucide-react';

interface HeroProps {
  onScrollToUpload: () => void;
  isBackendConnected: boolean;
  activeView: 'showcase' | 'studio';
  onViewChange: (view: 'showcase' | 'studio') => void;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToUpload,
  isBackendConnected,
  activeView,
  onViewChange,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full pt-4 pb-12 relative">
      {/* Sticky Floating Glassmorphic Navigation */}
      <div className="sticky top-4 z-50 w-full max-w-5xl mx-auto mb-10 px-4 sm:px-6">
        <div className="bg-[#0a0a0c]/85 backdrop-blur-xl border border-white/[0.08] rounded-2xl px-5 py-3 shadow-glass flex items-center justify-between transition-all duration-300">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-[#5E6AD2] flex items-center justify-center shadow-sm">
              <Cpu className="w-4 h-4" />
            </div>
            <div>
              <span className="font-sans font-semibold text-sm tracking-tight text-[#EDEDEF]">
                VERITAS <span className="text-[#8A8F98] text-xs font-normal">// Forensic Suite</span>
              </span>
            </div>
          </div>

          {/* Desktop Navigation Switcher */}
          <div className="hidden md:flex items-center space-x-1.5 p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <button
              type="button"
              onClick={() => onViewChange('showcase')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ${
                activeView === 'showcase'
                  ? 'bg-[#5E6AD2] text-white shadow-cta font-semibold'
                  : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>System Showcase</span>
            </button>

            <button
              type="button"
              onClick={() => onViewChange('studio')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 cursor-pointer ${
                activeView === 'studio'
                  ? 'bg-[#5E6AD2] text-white shadow-cta font-semibold'
                  : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.05]'
              }`}
            >
              <FileSearch className="w-3.5 h-3.5" />
              <span>Forensic Studio</span>
            </button>
          </div>

          {/* Desktop Backend Status Tag */}
          <div className="hidden lg:flex items-center space-x-3 text-xs font-medium">
            <div className="flex items-center space-x-2 bg-white/[0.04] border border-white/[0.06] px-3.5 py-1.5 rounded-full text-[#EDEDEF]">
              <span
                className="w-2 h-2 rounded-full transition-colors duration-300"
                style={{
                  backgroundColor: isBackendConnected ? '#10B981' : '#F59E0B',
                  boxShadow: isBackendConnected ? '0 0 10px rgba(16,185,129,0.5)' : '0 0 10px rgba(245,158,11,0.5)'
                }}
              />
              <span>{isBackendConnected ? 'Engine Active' : 'Connecting...'}</span>
            </div>
          </div>

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg bg-white/[0.05] text-[#EDEDEF] border border-white/[0.08] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-2 p-4 bg-[#0a0a0c]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-glass space-y-3 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/[0.06]">
              <button
                type="button"
                onClick={() => {
                  onViewChange('showcase');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold text-center ${
                  activeView === 'showcase' ? 'bg-[#5E6AD2] text-white' : 'bg-white/[0.05] text-[#8A8F98]'
                }`}
              >
                System Showcase
              </button>
              <button
                type="button"
                onClick={() => {
                  onViewChange('studio');
                  setMobileMenuOpen(false);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-semibold text-center ${
                  activeView === 'studio' ? 'bg-[#5E6AD2] text-white' : 'bg-white/[0.05] text-[#8A8F98]'
                }`}
              >
                Forensic Studio
              </button>
            </div>

            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#8A8F98]">Engine Status</span>
              <span className={isBackendConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
                {isBackendConnected ? 'Active' : 'Connecting'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs py-1">
              <span className="text-[#8A8F98]">Protocol</span>
              <span className="text-[#EDEDEF] font-mono">CASIA 2.0 / 11 Probes</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onViewChange('studio');
                setTimeout(() => onScrollToUpload(), 100);
              }}
              className="w-full mt-2 py-2.5 bg-[#5E6AD2] text-white rounded-lg text-xs font-semibold shadow-cta"
            >
              Deposit Image Evidence
            </button>
          </div>
        )}
      </div>

      {/* Main Narrative Hero (shown in Studio mode) */}
      {activeView === 'studio' && (
        <div className="max-w-4xl mx-auto text-center space-y-6 pt-4 relative z-10 px-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-[#5E6AD2] tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-[#5E6AD2]" />
            <span>Next-Generation Digital Forensics & XAI</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight leading-[1.08] bg-gradient-to-b from-white via-white/95 to-white/60 bg-clip-text text-transparent">
            Precision image forgery <br />
            <span className="shimmer-text">
              detection & analysis.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-[#8A8F98] max-w-2xl mx-auto leading-relaxed">
            An advanced multi-domain forensic suite. We inspect physical lighting geometry, 
            quantization artifacts, sensor noise residuals, and convolutional neural activations 
            with calm, verifiable precision.
          </p>

          {/* Action Button & Trust Marks */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              type="button"
              onClick={onScrollToUpload}
              className="min-h-[48px] px-8 py-3.5 bg-[#5E6AD2] hover:bg-[#6872D9] text-white font-semibold text-sm rounded-xl shadow-cta hover:shadow-glass-hover active:scale-[0.98] transition-all duration-200 flex items-center space-x-2.5 cursor-pointer"
            >
              <span>Deposit Image Evidence</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2 text-xs text-[#8A8F98] px-3 py-2 bg-white/[0.02] border border-white/[0.06] rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#5E6AD2]" />
              <span>11 Physical & Neural Probes</span>
            </div>
          </div>
        </div>
      )}

      {/* Subtle Divider Line */}
      <div className="w-full max-w-5xl mx-auto mt-12 px-4">
        <div className="h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
      </div>
    </header>
  );
};
