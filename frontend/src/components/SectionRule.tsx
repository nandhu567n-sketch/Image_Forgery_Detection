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
            <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#5D7052]/10 text-[#5D7052] text-xs font-bold tracking-wider">
              {number}
            </span>
          )}
          {title && (
            <h2 className="font-serif text-2xl md:text-3xl font-bold tracking-tight text-[#2C2C24]">
              {title}
            </h2>
          )}
        </div>
        {subtitle && (
          <span className="text-xs tracking-wider text-[#78786C] font-medium uppercase">
            ~ {subtitle}
          </span>
        )}
      </div>

      {/* Gentle timber rule with organic pebble center accent */}
      <div className="w-full h-[1.5px] bg-[#DED8CF] relative flex items-center justify-center">
        <div className="w-4 h-2.5 rounded-full bg-[#E6DCCD] border border-[#DED8CF]" />
      </div>
    </div>
  );
};
