import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  theme?: 'light' | 'dark';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', theme = 'light', showText = true }) => {
  const iconSize = size === 'sm' ? 24 : size === 'lg' ? 38 : 30;
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg';
  const subSize = size === 'sm' ? 'text-[9px]' : size === 'lg' ? 'text-xs' : 'text-[10px]';

  return (
    <div className="flex items-center gap-3 select-none group">
      {/* Bespoke Institutional Crest SVG: Scales of Justice + Legal Column + Quill */}
      <div className="relative flex-shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-br from-slate-900 via-[#0C1838] to-[#14234B] text-[#D4AF37] p-2 shadow-md border border-slate-800">
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="transition-transform duration-300 group-hover:scale-105"
        >
          {/* Outer Shield / Arch Frame */}
          <path
            d="M18 3L4 8V18C4 26 10 32.5 18 34C26 32.5 32 26 32 18V8L18 3Z"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Central Column / Pillar */}
          <path
            d="M18 9V27"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M14 27H22"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Scales Balance Beam */}
          <path
            d="M10 13H26"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
          {/* Left Scale Pan */}
          <path
            d="M10 13L7 19M10 13L13 19"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M6 19C6 21 14 21 14 19"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
          />
          {/* Right Scale Pan */}
          <path
            d="M26 13L23 19M26 13L29 19"
            stroke="currentColor"
            strokeWidth="1"
            strokeLinecap="round"
          />
          <path
            d="M22 19C22 21 30 21 30 19"
            stroke="currentColor"
            strokeWidth="1.25"
            fill="none"
          />
          {/* Seal Star at Top */}
          <circle cx="18" cy="7.5" r="1" fill="currentColor" />
        </svg>
      </div>

      {showText && (
        <div>
          <div className={`font-serif font-black tracking-tight leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-950'} ${textSize}`}>
            Juris<span className={theme === 'dark' ? 'text-[#D4AF37] font-sans font-bold' : 'text-[#0C1838] font-sans font-bold'}>Draft</span>
          </div>
          <div className={`font-sans font-semibold tracking-widest uppercase mt-1 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} ${subSize}`}>
            Enterprise Legal Repository
          </div>
        </div>
      )}
    </div>
  );
};
