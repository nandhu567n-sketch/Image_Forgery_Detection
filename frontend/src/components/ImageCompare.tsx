import React, { useState } from 'react';
import { Maximize2 } from 'lucide-react';

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
      <div className="w-full h-56 rounded-2xl border border-dashed border-[#DED8CF] bg-[#F0EBE5]/40 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="z-10 max-w-md space-y-2">
          <p className="text-xs uppercase tracking-wider text-[#5D7052] font-bold">
            [ Signal Map Not Computed ]
          </p>
          <p className="text-xs text-[#78786C] italic leading-relaxed">
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
      <div className="flex items-center justify-between border-b border-[#DED8CF]/80 pb-2.5 text-xs">
        <div className="flex items-center space-x-1.5">
          <button
            type="button"
            onClick={() => setViewMode('SIDE_BY_SIDE')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              viewMode === 'SIDE_BY_SIDE'
                ? 'bg-[#5D7052] text-white shadow-sm'
                : 'bg-white text-[#4A4A40] border border-[#DED8CF] hover:bg-[#F0EBE5]'
            }`}
          >
            Dual View
          </button>
          <button
            type="button"
            onClick={() => setViewMode('OVERLAY')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              viewMode === 'OVERLAY'
                ? 'bg-[#5D7052] text-white shadow-sm'
                : 'bg-white text-[#4A4A40] border border-[#DED8CF] hover:bg-[#F0EBE5]'
            }`}
          >
            Overlay
          </button>
          <button
            type="button"
            onClick={() => setViewMode('MAP_ONLY')}
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all duration-300 cursor-pointer ${
              viewMode === 'MAP_ONLY'
                ? 'bg-[#5D7052] text-white shadow-sm'
                : 'bg-white text-[#4A4A40] border border-[#DED8CF] hover:bg-[#F0EBE5]'
            }`}
          >
            Map Only
          </button>
        </div>

        <button
          type="button"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-1.5 rounded-full border border-[#DED8CF] bg-white text-[#4A4A40] hover:bg-[#5D7052] hover:text-white transition-all duration-300"
          title="Toggle Inspection Modal"
          aria-label="Toggle Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Visual Canvas Area */}
      <div
        className={`w-full rounded-2xl border border-[#DED8CF] bg-white p-3 shadow-sm relative ${
          isFullscreen ? 'fixed inset-4 z-50 bg-white p-8 shadow-float overflow-auto rounded-3xl' : ''
        }`}
      >
        {isFullscreen && (
          <div className="flex justify-between items-center pb-4 border-b border-[#DED8CF] mb-4">
            <span className="font-serif font-bold text-lg text-[#2C2C24]">
              Inspection Plate: {title}
            </span>
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-4 py-1.5 bg-[#2C2C24] text-white rounded-full text-xs font-bold"
            >
              Close
            </button>
          </div>
        )}

        {viewMode === 'SIDE_BY_SIDE' && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[#78786C] uppercase tracking-wider">
                Source Evidence
              </div>
              <div className="aspect-square bg-[#F0EBE5] rounded-xl border border-[#DED8CF]/60 overflow-hidden flex items-center justify-center">
                {originalSrc ? (
                  <img
                    src={originalSrc}
                    alt="Original Input"
                    className="w-full h-full object-contain filter grayscale"
                  />
                ) : (
                  <span className="text-xs text-[#78786C]">No Media Loaded</span>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[11px] font-bold text-[#78786C] uppercase tracking-wider">
                Signal Heatmap
              </div>
              <div className="aspect-square bg-white rounded-xl border border-[#DED8CF] overflow-hidden flex items-center justify-center">
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
            <div className="text-[11px] font-bold text-[#78786C] uppercase tracking-wider">
              Multiply Blend Overlay (Dense Tone = Elevated Anomaly)
            </div>
            <div className="aspect-square max-h-80 w-full mx-auto bg-white rounded-xl border border-[#DED8CF] relative overflow-hidden flex items-center justify-center">
              {originalSrc && (
                <img
                  src={originalSrc}
                  alt="Base Image"
                  className="absolute inset-0 w-full h-full object-contain filter grayscale opacity-60"
                />
              )}
              <img
                src={mapDataUri}
                alt={`${title} Overlay Map`}
                className="absolute inset-0 w-full h-full object-contain mix-blend-multiply opacity-90 filter contrast-150"
              />
            </div>
          </div>
        )}

        {viewMode === 'MAP_ONLY' && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-[#78786C] uppercase tracking-wider">
              8-Bit High-Resolution Signal Distribution
            </div>
            <div className="aspect-square max-h-80 w-full mx-auto bg-white rounded-xl border border-[#DED8CF] overflow-hidden flex items-center justify-center">
              <img
                src={mapDataUri}
                alt={`${title} High-Res Map`}
                className="w-full h-full object-contain filter contrast-125"
              />
            </div>
          </div>
        )}
      </div>

      {/* 5-Step Grayscale Step Bar inside Rounded Pill Track */}
      <div className="space-y-1.5 pt-1">
        <div className="flex justify-between items-center text-[11px] font-semibold text-[#78786C]">
          <span>Low Residual (0%)</span>
          <span className="font-bold text-[#2C2C24] uppercase tracking-wider">Anomaly Density</span>
          <span>High Residual (100%)</span>
        </div>
        <div className="grid grid-cols-5 gap-1 h-3 w-full rounded-full border border-[#DED8CF] p-0.5 bg-white overflow-hidden shadow-inner">
          <div className="bg-white rounded-l-full" title="0% - Low" />
          <div className="bg-[#E5E5E5]" title="25% - Marginal" />
          <div className="bg-[#A3A3A3]" title="50% - Moderate" />
          <div className="bg-[#525252]" title="75% - Elevated" />
          <div className="bg-[#2C2C24] rounded-r-full" title="100% - Critical" />
        </div>
      </div>
    </div>
  );
};
