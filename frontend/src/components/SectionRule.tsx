import React from 'react';

interface SectionRuleProps {
  title?: string;
  subtitle?: string;
  number?: string;
  thick?: boolean;
}

export const SectionRule: React.FC<SectionRuleProps> = ({
  title,
  subtitle,
  number,
}) => {
  return (
    <div className="w-full my-12">
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 gap-2">
        <div className="flex items-center space-x-3">
          {number && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#5E6AD2]/20 border border-[#5E6AD2]/30 text-[#5E6AD2] text-xs font-mono font-semibold tracking-wider">
              {number}
            </span>
          )}
          {title && (
            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#EDEDEF]">
              {title}
            </h2>
          )}
        </div>
        {subtitle && (
          <span className="text-xs tracking-widest text-[#8A8F98] font-mono uppercase">
            // {subtitle}
          </span>
        )}
      </div>

      {/* Hairline rule with subtle gradient */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
    </div>
  );
};
