import React from 'react';

interface LinearBadgeProps {
  children: React.ReactNode;
  variant?: 'accent' | 'neutral' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  className?: string;
  dot?: boolean;
}

export const LinearBadge: React.FC<LinearBadgeProps> = ({
  children,
  variant = 'accent',
  size = 'md',
  className = '',
  dot = false,
}) => {
  const variantStyles = {
    accent: 'bg-[#5E6AD2]/15 text-[#6872D9] border-[#5E6AD2]/30',
    neutral: 'bg-white/[0.04] text-[#8A8F98] border-white/[0.08]',
    success: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    danger: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  };

  const dotColors = {
    accent: 'bg-[#5E6AD2]',
    neutral: 'bg-[#8A8F98]',
    success: 'bg-emerald-400',
    warning: 'bg-amber-400',
    danger: 'bg-rose-400',
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 font-mono tracking-wider',
    md: 'text-xs px-3 py-1 font-mono tracking-wide',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} animate-pulse`}
        />
      )}
      <span>{children}</span>
    </span>
  );
};
