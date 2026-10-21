import React from 'react';
import { LinearBadge } from './LinearBadge';

interface MetadataTableProps {
  details?: Record<string, any>;
  available: boolean;
  message: string;
}

export const MetadataTable: React.FC<MetadataTableProps> = ({
  details,
  available,
  message,
}) => {
  if (!available || !details || Object.keys(details).length === 0) {
    return (
      <div className="w-full h-56 rounded-xl border border-dashed border-white/[0.08] bg-white/[0.02] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="z-10 max-w-md space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-[#5E6AD2]">
            [ Container Stripped // No EXIF Headers ]
          </p>
          <p className="text-xs text-[#8A8F98] italic leading-relaxed font-sans">
            {message || 'The uploaded file contains no digital camera metadata stream. EXIF tags may have been stripped during web optimization or export.'}
          </p>
        </div>
      </div>
    );
  }

  const rawExif = details.raw_exif || {};
  const anomalies: string[] = details.anomalies || [];

  const displayRows = [
    { key: 'Camera Make', value: rawExif.Make || 'Not Specified' },
    { key: 'Camera Model', value: rawExif.Model || 'Not Specified' },
    { key: 'Software / Tool', value: rawExif.Software || details.software_tag || 'None Reported' },
    { key: 'Capture Timestamp', value: rawExif.DateTimeOriginal || 'Not Present' },
    { key: 'Modified Timestamp', value: rawExif.DateTime || 'Not Present' },
    { key: 'EXIF Dimensions', value: details.exif_dimensions ? `${details.exif_dimensions[0]}x${details.exif_dimensions[1]}` : 'Unknown' },
    { key: 'Actual Dimensions', value: details.actual_dimensions ? `${details.actual_dimensions[0]}x${details.actual_dimensions[1]}` : 'Unknown' },
    { key: 'GPS Information', value: details.has_gps ? 'Present (Geo-tagged)' : 'None' },
  ];

  return (
    <div className="w-full space-y-3 text-xs">
      <div className="rounded-xl border border-white/[0.08] overflow-hidden bg-[#0a0a0c] shadow-inner">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.04] text-[#EDEDEF] text-[11px] font-mono uppercase tracking-wider border-b border-white/[0.08]">
              <th className="py-2.5 px-3.5 font-semibold border-r border-white/[0.06]">EXIF Parameter</th>
              <th className="py-2.5 px-3.5 font-semibold border-r border-white/[0.06]">Extracted Value</th>
              <th className="py-2.5 px-3.5 font-semibold">Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04] font-mono">
            {displayRows.map((row, idx) => {
              const isSoftwareRow = row.key.includes('Software') && row.value !== 'None Reported';
              const isDimensionMismatch = row.key.includes('Dimensions') && details.dimensions_match === false;
              const hasFlag = isSoftwareRow || isDimensionMismatch;

              return (
                <tr key={idx} className="hover:bg-white/[0.03] transition-colors duration-150">
                  <td className="py-2 px-3.5 font-medium text-[#EDEDEF] border-r border-white/[0.06] whitespace-nowrap">
                    {row.key}
                  </td>
                  <td className="py-2 px-3.5 text-[#8A8F98] border-r border-white/[0.06] break-all">
                    {String(row.value)}
                  </td>
                  <td className="py-2 px-3.5 whitespace-nowrap">
                    {hasFlag ? (
                      <LinearBadge variant="danger" size="sm">
                        Anomaly Flagged
                      </LinearBadge>
                    ) : (
                      <LinearBadge variant="success" size="sm">
                        Verified
                      </LinearBadge>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {anomalies.length > 0 && (
        <div className="p-3.5 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-1">
          <div className="font-mono text-[11px] font-semibold text-rose-400 uppercase tracking-wider">
            [!] Detected Metadata Anomalies:
          </div>
          <ul className="list-disc pl-4 space-y-0.5 text-rose-200 text-xs font-mono">
            {anomalies.map((anom, i) => (
              <li key={i}>{anom}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
