import React from 'react';

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
      <div className="w-full h-56 rounded-2xl border border-dashed border-[#DED8CF] bg-[#F0EBE5]/40 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="z-10 max-w-md space-y-2">
          <p className="text-xs uppercase tracking-wider text-[#5D7052] font-bold">
            [ Container Stripped // No EXIF Headers ]
          </p>
          <p className="text-xs text-[#78786C] italic leading-relaxed">
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
      <div className="rounded-2xl border border-[#DED8CF] overflow-hidden bg-white shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F0EBE5] text-[#2C2C24] text-[11px] uppercase tracking-wider border-b border-[#DED8CF]">
              <th className="py-2.5 px-3.5 font-bold border-r border-[#DED8CF]/60">EXIF Parameter</th>
              <th className="py-2.5 px-3.5 font-bold border-r border-[#DED8CF]/60">Extracted Value</th>
              <th className="py-2.5 px-3.5 font-bold">Assessment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DED8CF]/60 bg-white">
            {displayRows.map((row, idx) => {
              const isSoftwareRow = row.key.includes('Software') && row.value !== 'None Reported';
              const isDimensionMismatch = row.key.includes('Dimensions') && details.dimensions_match === false;
              const hasFlag = isSoftwareRow || isDimensionMismatch;

              return (
                <tr key={idx} className="hover:bg-[#FDFCF8] transition-colors duration-200">
                  <td className="py-2 px-3.5 font-semibold text-[#2C2C24] border-r border-[#DED8CF]/60 whitespace-nowrap">
                    {row.key}
                  </td>
                  <td className="py-2 px-3.5 text-[#4A4A40] border-r border-[#DED8CF]/60 break-all">
                    {String(row.value)}
                  </td>
                  <td className="py-2 px-3.5 whitespace-nowrap">
                    {hasFlag ? (
                      <span className="bg-[#A85448] text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
                        Anomaly Flagged
                      </span>
                    ) : (
                      <span className="text-[#5D7052] font-semibold text-[10px]">
                        Verified
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {anomalies.length > 0 && (
        <div className="p-3.5 rounded-xl border border-[#A85448]/30 bg-[#A85448]/5 space-y-1">
          <div className="font-bold text-[#A85448] uppercase tracking-wider text-[11px]">
            [!] Detected Metadata Anomalies:
          </div>
          <ul className="list-disc pl-4 space-y-0.5 text-[#4A4A40] text-[11px]">
            {anomalies.map((anom, i) => (
              <li key={i}>{anom}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
