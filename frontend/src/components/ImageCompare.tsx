import React, { useState } from 'react';
import { Maximize2, X } from 'lucide-react';

interface ImageCompareProps {
  originalSrc: string | null;
  mapSrc: string | null;
  title: string;
  available: boolean;
  emptyMessage?: string;
}

export const ImageCompare: React.FC<ImageCompareProps> = ({
  originalSrc,
  mapSrc,
  title,
  available,
  emptyMessage = 'Visual evidence map unavailable for this signal domain.',
}) => {
  const [viewMode, setViewMode] = useState<'SIDE_BY_SIDE' | 'OVERLAY' | 'MAP_ONLY'>('SIDE_BY_SIDE');
  const [isFullscreen, setIsFullscreen] = useState(false);

  if (!available || !mapSrc) {
    return (
      <div className="w-full h-56 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="z-10 max-w-md space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2]">
            [ Signal Map Not Computed ]
          </p>
          <p className="text-xs text-[#8A8F98] italic leading-relaxed font-sans">
            {emptyMessage}
          </p>
        </div>
      </div>
    );
  }

  const mapDataUri = mapSrc.startsWith('data:') ? mapSrc : `data:image/png;base64,${mapSrc}`;

  return (
    <div className="w-full space-y-3">
      {/* View Switcher Pills */}
      <div className="flex items-center justify-between border-b border-white/[0.06] pb-2.5 text-xs">
        <div className="flex items-center space-x-1.5 p-0.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
          <button
            type="button"
            onClick={() => setViewMode('SIDE_BY_SIDE')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
              viewMode === 'SIDE_BY_SIDE'
                ? 'bg-[#5E6AD2] text-white shadow-cta font-semibold'
                : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
            }`}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('OVERLAY')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
              viewMode === 'OVERLAY'
                ? 'bg-[#5E6AD2] text-white shadow-cta font-semibold'
                : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
            }`}
          >
            Overlay
          </button>
          <button
            type="button"
            onClick={() => setViewMode('MAP_ONLY')}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 cursor-pointer ${
              viewMode === 'MAP_ONLY'
                ? 'bg-[#5E6AD2] text-white shadow-cta font-semibold'
                : 'text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.04]'
            }`}
          >
            Map Only
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#8A8F98] hover:text-[#EDEDEF] hover:bg-white/[0.08] transition-all duration-200 cursor-pointer"
          title="Toggle Inspection Modal"
          aria-label="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visual Canvas Area */}
      <div
        className={`w-full rounded-xl border border-white/[0.08] bg-[#020203] p-3 shadow-inner relative ${
          isFullscreen
            ? 'fixed inset-4 z-50 bg-[#0a0a0c]/98 backdrop-blur-2xl p-6 sm:p-8 shadow-glass overflow-auto rounded-2xl border border-white/[0.12]'
            : ''
        }`}
      >
        {isFullscreen && (
          <div className="flex justify-between items-center pb-4 border-b border-white/[0.08] mb-4">
            <span className="font-semibold text-lg text-[#EDEDEF]">
              Inspection Plate: {title}
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-[#EDEDEF] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {viewMode === 'SIDE_BY_SIDE' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8F98]">
                Source Evidence
              </div>
              <div className="aspect-square bg-black rounded-lg border border-white/[0.06] overflow-hidden flex items-center justify-center">
                {originalSrc ? (
                  <img
                    src={originalSrc}
                    alt="Original Input"
                    className="w-full h-full object-contain filter grayscale"
                  />
                ) : (
                  <span className="text-xs text-[#8A8F98] font-mono">No Media Loaded</span>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8F98]">
                Signal Heatmap
              </div>
              <div className="aspect-square bg-black rounded-lg border border-white/[0.06] overflow-hidden flex items-center justify-center">
                <img
                  src={mapDataUri}
                  alt={`${title} Map`}
                  className="w-full h-full object-contain filter contrast-125"
                />
              </div>
            </div>
          </div>
        )}

        {viewMode === 'OVERLAY' && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8F98]">
              Multiply Blend Overlay (Dense Tone = Elevated Anomaly)
            </div>
            <div className="aspect-square max-h-80 w-full mx-auto bg-black rounded-lg border border-white/[0.06] relative overflow-hidden flex items-center justify-center">
              {originalSrc && (
                <img
                  src={originalSrc}
                  alt="Base Image"
                  className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-50"
                />
              )}
              <img
                src={mapDataUri}
                alt={`${title} Overlay Map`}
                className="absolute inset-0 w-full h-full object-contain mix-blend-screen opacity-90 filter contrast-150"
              />
            </div>
          </div>
        )}

        {viewMode === 'MAP_ONLY' && (
          <div className="space-y-1.5">
            <div className="text-[10px] font-mono uppercase tracking-widest text-[#8A8F98]">
              8-Bit High-Resolution Signal Distribution
            </div>
            <div className="aspect-square max-h-80 w-full mx-auto bg-black rounded-lg border border-white/[0.06] overflow-hidden flex items-center justify-center">
              <img
                src={mapDataUri}
                alt={`${title} High-Res Map`}
                className="w-full h-full object-contain filter contrast-125"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5-Step Grayscale Step Bar */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[10px] font-mono text-[#8A8F98]">
          <span>Low Residual (0%)</span>
          <span className="uppercase tracking-widest text-[#EDEDEF]">Anomaly Density</span>
          <span>High Residual (100%)</span>
        </div>
        <div className="grid grid-cols-5 gap-1 h-2 w-full rounded-full border border-white/[0.08] p-0.5 bg-white/[0.03] overflow-hidden">
          <div className="bg-white/[0.1] rounded-l-full" title="0% - Low" />
          <div className="bg-white/[0.25]" title="25% - Marginal" />
          <div className="bg-indigo-500/50" title="50% - Moderate" />
          <div className="bg-[#5E6AD2]" title="75% - Elevated" />
          <div className="bg-white rounded-r-full" title="100% - Critical" />
        </div>
      </div>
    </div>
  );
};
