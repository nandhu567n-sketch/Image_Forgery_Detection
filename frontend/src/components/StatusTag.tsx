import React from 'react';
import type { StatusTagLevel } from '../types/forensic';

interface StatusTagProps {
  level: StatusTagLevel;
  customLabel?: string;
}

export const StatusTag: React.FC<StatusTagProps> = ({ level, customLabel }) => {
  const label = customLabel || level;

  switch (level) {
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1.5 bg-rose-500/15 border border-rose-500/30 text-rose-300 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          {label}
        </span>
      );
    case 'MODERATE':
      return (
        <span className="inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
          {label}
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-flex items-center gap-1.5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {label}
        </span>
      );
    case 'UNAVAILABLE':
    default:
      return (
        <span className="inline-flex items-center bg-white/[0.04] border border-white/[0.08] text-[#8A8F98] px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-wide">
          {label}
        </span>
      );
  }
};
