import React from 'react';

export interface LinearButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
}

export const LinearButton: React.FC<LinearButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5 min-h-[32px]',
    md: 'text-xs sm:text-sm px-4 py-2.5 rounded-lg gap-2 min-h-[40px]',
    lg: 'text-sm sm:text-base px-6 py-3.5 rounded-xl gap-2.5 min-h-[48px]',
  };

  const variantStyles = {
    primary:
      'bg-[#5E6AD2] hover:bg-[#6872D9] text-white shadow-cta hover:shadow-glass-hover active:scale-[0.98] btn-shine-effect border border-[#5E6AD2]/50 font-medium',
    secondary:
      'bg-white/[0.05] hover:bg-white/[0.08] text-[#EDEDEF] border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] active:scale-[0.98] hover:border-white/[0.15] font-medium',
    ghost:
      'bg-transparent hover:bg-white/[0.05] text-[#8A8F98] hover:text-[#EDEDEF] active:scale-[0.98] font-normal',
    danger:
      'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 active:scale-[0.98] font-medium',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      disabled={isDisabled}
      className={`inline-flex items-center justify-center font-sans tracking-normal transition-all duration-200 cursor-pointer select-none ${
        sizeStyles[size]
      } ${variantStyles[variant]} ${
        isDisabled ? 'opacity-50 cursor-not-allowed hover:bg-transparent pointer-events-none' : ''
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="flex-shrink-0">{icon}</span>
      )}
      <span>{children}</span>
      {!isLoading && icon && iconPosition === 'right' && (
        <span className="flex-shrink-0">{icon}</span>
      )}
    </button>
  );
};
