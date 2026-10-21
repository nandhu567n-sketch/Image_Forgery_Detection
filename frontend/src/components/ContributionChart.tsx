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
      <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0a0a0c] text-center text-xs text-[#8A8F98] font-mono">
        No fusion attribution coefficients recorded.
      </div>
    );
  }

  const maxAbs = Math.max(...entries.map(([, v]) => Math.abs(v)), 0.1);

  return (
    <div className="w-full rounded-2xl border border-white/[0.08] bg-[#0a0a0c]/90 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-glass">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/[0.06] pb-4 gap-2">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-[#EDEDEF]">
            Signal Attribution & Feature Contributions
          </h3>
          <p className="text-xs text-[#8A8F98] font-mono mt-0.5">
            Logistic regression calibrated contributions (w_i · x_i)
          </p>
        </div>

        <div className="flex items-center space-x-4 text-xs font-mono">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-[#8A8F98]">Authentic (- )</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#5E6AD2]" />
            <span className="text-[#EDEDEF]">Forged (+ )</span>
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
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#EDEDEF] font-medium">
                  {formattedKey}
                </span>
                <span className={val >= 0 ? 'text-[#6872D9] font-semibold' : 'text-amber-400 font-semibold'}>
                  {val >= 0 ? `+${val.toFixed(4)}` : val.toFixed(4)}
                </span>
              </div>

              {/* Zero-Centered Rounded Track */}
              <div className="w-full h-4 rounded-full border border-white/[0.08] bg-white/[0.03] relative flex overflow-hidden">
                {/* Left Side (Negative / Authentic) */}
                <div className="w-1/2 h-full flex justify-end items-center pr-0.5">
                  {!isPositive && (
                    <div
                      className="h-2.5 rounded-l-full bg-amber-400 transition-all duration-500 ease-out"
                      style={{ width: `${barWidthPercent * 2}%` }}
                    />
                  )}
                </div>

                {/* Center Divider */}
                <div className="w-[1.5px] h-full bg-white/20 z-10" />

                {/* Right Side (Positive / Forged) */}
                <div className="w-1/2 h-full flex justify-start items-center pl-0.5">
                  {isPositive && (
                    <div
                      className="h-2.5 rounded-r-full bg-[#5E6AD2] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(94,106,210,0.4)]"
                      style={{ width: `${barWidthPercent * 2}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between items-center pt-3 text-[11px] font-mono text-[#8A8F98] border-t border-white/[0.06]">
        <span>← Deflects toward Authentic (Negative)</span>
        <span className="text-[#EDEDEF] font-semibold">[ 0.00 Equilibrium ]</span>
        <span>Deflects toward Forged (Positive) →</span>
      </div>
    </div>
  );
};
