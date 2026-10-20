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
        <span className="inline-block bg-[#2C2C24] text-white px-3 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm">
          {label}
        </span>
      );
    case 'MODERATE':
      return (
        <span className="inline-block border-2 border-[#C18C5D] bg-white text-[#C18C5D] px-3 py-0.5 rounded-full text-xs font-bold tracking-wide uppercase">
          {label}
        </span>
      );
    case 'LOW':
      return (
        <span className="inline-block border border-[#DED8CF] bg-white text-[#78786C] px-3 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase">
          {label}
        </span>
      );
    case 'UNAVAILABLE':
    default:
      return (
        <span className="inline-block border border-dashed border-[#DED8CF] bg-[#F0EBE5]/60 text-[#78786C]/80 px-3 py-0.5 rounded-full text-xs tracking-wide uppercase">
          {label}
        </span>
      );
  }
};
