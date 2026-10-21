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
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-[#8A8F98] tracking-wider uppercase">{label}</span>
        <span className="font-semibold text-[#EDEDEF]">
          {isAvailable ? clampedScore.toFixed(4) : 'N/A'}
        </span>
      </div>

      <div className="w-full h-2 rounded-full border border-white/[0.08] bg-white/[0.04] p-0.5 relative overflow-hidden">
        {isAvailable ? (
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#5E6AD2] to-[#6872D9] transition-all duration-500 ease-out shadow-[0_0_8px_rgba(94,106,210,0.5)]"
            style={{ width: `${percentage}%` }}
          />
        ) : (
          <div className="h-full w-full bg-white/[0.02]" />
        )}
      </div>

      {showTicks && (
        <div className="flex justify-between text-[10px] font-mono text-[#8A8F98] pt-0.5">
          <span>0.00 (Authentic)</span>
          <span>0.50 (Suspicious)</span>
          <span>1.00 (Forged)</span>
        </div>
      )}
    </div>
  );
};
