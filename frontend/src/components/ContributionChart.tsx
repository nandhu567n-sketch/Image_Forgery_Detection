import React from 'react';

interface ContributionChartProps {
  contributions: Record<string, number>;
}

export const ContributionChart: React.FC<ContributionChartProps> = ({
  contributions,
}) => {
  const entries = Object.entries(contributions);

  if (entries.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-[#DED8CF] bg-white text-center text-xs text-[#78786C]">
        No fusion attribution coefficients recorded.
      </div>
    );
  }

  const maxAbs = Math.max(...entries.map(([_, v]) => Math.abs(v)), 0.1);

  return (
    <div className="w-full rounded-2xl border border-[#DED8CF] bg-white p-6 sm:p-8 space-y-6 shadow-soft">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#DED8CF]/70 pb-4 gap-2">
        <div>
          <h3 className="font-serif text-xl font-bold tracking-tight text-[#2C2C24]">
            Signal Attribution & Feature Contributions
          </h3>
          <p className="text-xs text-[#78786C] font-medium mt-0.5">
            Logistic regression weighted contributions (w_i · x_i)
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-semibold">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#C18C5D]" />
            <span className="text-[#4A4A40]">Authentic (- )</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-[#5D7052]" />
            <span className="text-[#4A4A40]">Forged (+ )</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 text-xs">
        {entries.map(([key, val]) => {
          const isPositive = val >= 0;
          const barWidthPercent = Math.min(100, Math.round((Math.abs(val) / maxAbs) * 50));
          const formattedKey = key.toUpperCase().replace('_', ' ');

          return (
            <div key={key} className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#2C2C24] font-bold">
                  {formattedKey}
                </span>
                <span className={val >= 0 ? 'text-[#5D7052] font-bold' : 'text-[#C18C5D] font-bold'}>
                  {val >= 0 ? `+${val.toFixed(4)}` : val.toFixed(4)}
                </span>
              </div>

              {/* Zero-Centered Rounded Track */}
              <div className="w-full h-5 rounded-full border border-[#DED8CF] bg-[#F0EBE5]/50 relative flex overflow-hidden">
                {/* Left Side (Negative / Authentic) */}
                <div className="w-1/2 h-full flex justify-end items-center pr-0.5">
                  {!isPositive && (
                    <div
                      className="h-3 rounded-l-full bg-[#C18C5D] transition-all duration-500 ease-out"
                      style={{ width: `${barWidthPercent * 2}%` }}
                    />
                  )}
                </div>

                {/* Center Divider */}
                <div className="w-[1.5px] h-full bg-[#DED8CF] z-10" />

                {/* Right Side (Positive / Forged) */}
                <div className="w-1/2 h-full flex justify-start items-center pl-0.5">
                  {isPositive && (
                    <div
                      className="h-3 rounded-r-full bg-[#5D7052] transition-all duration-500 ease-out"
                      style={{ width: `${barWidthPercent * 2}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3 text-[11px] font-semibold text-[#78786C] border-t border-[#DED8CF]/60">
        <span>← Deflects toward Authentic (Clay -)</span>
        <span className="font-bold text-[#4A4A40]">[ 0.00 Equilibrium ]</span>
        <span>Deflects toward Forged (Moss +) →</span>
      </div>
    </div>
  );
};
