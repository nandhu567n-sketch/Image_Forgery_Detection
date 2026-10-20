import React from 'react';

interface ScoreMeterProps {
  score: number | null;
  label?: string;
  showTicks?: boolean;
}

export const ScoreMeter: React.FC<ScoreMeterProps> = ({
  score,
  label = 'SIGNAL MAGNITUDE',
  showTicks = true,
}) => {
  const isAvailable = score !== null && !isNaN(score);
  const clampedScore = isAvailable ? Math.max(0, Math.min(1, score)) : 0;
  const percentage = Math.round(clampedScore * 100);

  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-[#78786C] tracking-wide uppercase">{label}</span>
        <span className="font-bold text-[#2C2C24]">
          {isAvailable ? clampedScore.toFixed(4) : 'N/A'}
        </span>
      </div>

      <div className="w-full h-2.5 rounded-full border border-[#DED8CF] bg-[#F0EBE5]/70 p-0.5 relative overflow-hidden">
        {isAvailable ? (
          <div
            className="h-full rounded-full bg-[#5D7052] transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        ) : (
          <div className="h-full w-full bg-[#E6DCCD]/40" />
        )}
      </div>

      {showTicks && (
        <div className="flex justify-between text-[11px] font-semibold text-[#78786C] pt-0.5">
          <span>0.00 (Authentic)</span>
          <span>0.50 (Suspicious)</span>
          <span>1.00 (Forged)</span>
        </div>
      )}
    </div>
  );
};
