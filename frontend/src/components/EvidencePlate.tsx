import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import type { TechniquePlateMeta, TechniqueReport } from '../types/forensic';
import { StatusTag } from './StatusTag';
import { ScoreMeter } from './ScoreMeter';
import { ImageCompare } from './ImageCompare';
import { MetadataTable } from './MetadataTable';
import { AdversarialTable } from './AdversarialTable';

interface EvidencePlateProps {
  meta: TechniquePlateMeta;
  report?: TechniqueReport;
  originalImageSrc: string | null;
}

export const EvidencePlate: React.FC<EvidencePlateProps> = ({
  meta,
  report,
  originalImageSrc,
}) => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isAvailable = report?.available ?? false;
  const score = report?.score ?? null;

  let statusLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'UNAVAILABLE' = 'UNAVAILABLE';
  if (isAvailable && score !== null) {
    if (score >= 0.65) statusLevel = 'HIGH';
    else if (score >= 0.35) statusLevel = 'MODERATE';
    else statusLevel = 'LOW';
  } else if (!isAvailable) {
    statusLevel = 'UNAVAILABLE';
  }

  return (
    <article className="rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.06] to-white/[0.02] p-6 shadow-glass hover:shadow-glass-hover hover:border-white/[0.12] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4 relative overflow-hidden">
      {/* Top Edge Highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />

      {/* Plate Header */}
      <div className="space-y-2.5 border-b border-white/[0.06] pb-4">
        <div className="flex items-center justify-between text-xs font-mono">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#5E6AD2]/15 border border-[#5E6AD2]/30 text-[#6872D9] font-semibold tracking-wider text-[11px]">
              Plate {meta.index}
            </span>
            <span className="text-[#8A8F98] uppercase tracking-wider hidden sm:inline text-[10px]">
              [{meta.domain}]
            </span>
          </div>
          <StatusTag level={statusLevel} />
        </div>

        <div>
          <h3 className="font-semibold text-xl tracking-tight text-[#EDEDEF]">
            {meta.title}
          </h3>
          <p className="text-[11px] font-mono text-[#8A8F98] tracking-wide mt-0.5">
            // {meta.tagline}
          </p>
        </div>

        <p className="text-xs text-[#8A8F98] leading-relaxed">
          {meta.description}
        </p>

        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-[#8A8F98] leading-relaxed">
          <span className="font-mono text-[#5E6AD2] uppercase mr-1.5 text-[10px] font-semibold">
            Forensic Example:
          </span>
          {meta.example}
        </div>
      </div>

      {/* Visual / Data Representation Area */}
      <div className="w-full py-1">
        {meta.key === 'metadata' ? (
          <MetadataTable
            available={isAvailable}
            details={report?.details}
            message={report?.message || 'Container EXIF inspection.'}
          />
        ) : meta.key === 'adversarial' ? (
          <AdversarialTable
            available={isAvailable}
            score={score}
            details={report?.details}
          />
        ) : (
          <ImageCompare
            originalSrc={originalImageSrc}
            mapSrc={report?.map_base64 || null}
            title={meta.title}
            available={isAvailable}
            emptyMessage={report?.message || 'Visual evidence map not available.'}
          />
        )}
      </div>

      {/* Score and Findings */}
      <div className="space-y-3 pt-3 border-t border-white/[0.06]">
        <ScoreMeter score={score} label={`${meta.title} Magnitude`} />

        <div className="bg-white/[0.02] p-3.5 rounded-xl border border-white/[0.05] text-xs">
          <div className="font-mono text-[#EDEDEF] uppercase tracking-wider text-[10px] mb-1 font-semibold">
            Forensic Observation:
          </div>
          <p className="text-[#8A8F98] italic leading-relaxed font-sans">
            "{report?.message || 'Module evaluation pending pipeline run.'}"
          </p>
        </div>

        {/* Technical Details Drawer */}
        {report?.details && Object.keys(report.details).length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex items-center justify-between w-full py-1.5 text-xs font-mono text-[#5E6AD2] border-t border-dashed border-white/[0.08] hover:text-[#6872D9] cursor-pointer transition-colors"
            >
              <span>[Technical Analysis Parameters]</span>
              {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {detailsOpen && (
              <div className="mt-2 p-3 bg-[#0a0a0c] rounded-xl border border-white/[0.08] text-xs font-mono space-y-1.5 overflow-x-auto shadow-inner">
                {Object.entries(report.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 border-b border-white/[0.04]">
                    <span className="text-[#EDEDEF]">{k}:</span>
                    <span className="text-[#8A8F98]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
};
