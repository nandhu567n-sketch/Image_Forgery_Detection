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
    <article className="rounded-2xl border border-[#DED8CF] bg-white p-6 shadow-soft hover:shadow-float hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between space-y-4">
      {/* Plate Header */}
      <div className="space-y-2 border-b border-[#DED8CF]/70 pb-3.5">
        <div className="flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full bg-[#5D7052]/10 text-[#5D7052] font-bold tracking-wide">
              Plate {meta.index}
            </span>
            <span className="text-[#78786C] uppercase tracking-wider hidden sm:inline text-[11px]">
              [{meta.domain}]
            </span>
          </div>
          <StatusTag level={statusLevel} />
        </div>

        <div>
          <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#2C2C24]">
            {meta.title}
          </h3>
          <p className="text-xs text-[#78786C] font-semibold tracking-wide mt-0.5">
            // {meta.tagline}
          </p>
        </div>

        <p className="text-sm text-[#4A4A40] leading-relaxed">
          {meta.description}
        </p>

        <div className="p-3 rounded-xl bg-[#F0EBE5]/50 border border-[#DED8CF]/60 text-xs italic text-[#4A4A40] leading-relaxed">
          <span className="not-italic font-bold text-[#5D7052] uppercase mr-1.5 text-[11px]">
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
      <div className="space-y-3 pt-3 border-t border-[#DED8CF]/70">
        <ScoreMeter score={score} label={`${meta.title} Magnitude`} />

        <div className="bg-[#F0EBE5]/50 p-3.5 rounded-xl border border-[#DED8CF]/60 text-xs">
          <div className="font-bold text-[#2C2C24] uppercase tracking-wider text-[11px] mb-1">
            Forensic Observation:
          </div>
          <p className="text-[#4A4A40] italic leading-relaxed">
            "{report?.message || 'Module evaluation pending pipeline run.'}"
          </p>
        </div>

        {/* Technical Details Drawer */}
        {report?.details && Object.keys(report.details).length > 0 && (
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="flex items-center justify-between w-full py-1.5 text-xs font-bold text-[#5D7052] border-t border-dashed border-[#DED8CF] hover:text-[#45543D] cursor-pointer transition-colors"
            >
              <span>[Technical Analysis Parameters]</span>
              {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {detailsOpen && (
              <div className="mt-2 p-3 bg-[#F0EBE5]/60 rounded-xl border border-[#DED8CF]/60 text-xs space-y-1.5 overflow-x-auto">
                {Object.entries(report.details).map(([k, v]) => (
                  <div key={k} className="flex justify-between py-0.5 border-b border-[#DED8CF]/40">
                    <span className="font-semibold text-[#2C2C24]">{k}:</span>
                    <span className="text-[#78786C]">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
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
