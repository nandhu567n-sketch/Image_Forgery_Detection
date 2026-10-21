import React, { useRef, useState } from 'react';

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
  variant?: 'default' | 'glass' | 'elevated';
  enableHoverTranslate?: boolean;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = '',
  spotlightColor = 'rgba(94, 106, 210, 0.15)',
  spotlightSize = 300,
  variant = 'default',
  enableHoverTranslate = true,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setCoords(null);
  };

  const variantStyles = {
    default: 'bg-gradient-to-b from-white/[0.08] to-white/[0.02] border border-white/[0.06]',
    glass: 'bg-[#0a0a0c]/80 backdrop-blur-xl border border-white/[0.08]',
    elevated: 'bg-[#0a0a0c] border border-white/[0.08]',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ease-out shadow-glass hover:shadow-glass-hover hover:border-white/[0.12] ${
        enableHoverTranslate ? 'hover:-translate-y-1' : ''
      } ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {/* Top Edge Inner Glow Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none z-10" />

      {/* Mouse-Tracking Spotlight Overlay */}
      {isHovered && coords && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(${spotlightSize}px circle at ${coords.x}px ${coords.y}px, ${spotlightColor}, transparent 70%)`,
          }}
        />
      )}

      {/* Card Content Container */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
