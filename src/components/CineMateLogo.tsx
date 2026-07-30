import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const CineMateIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-[0_0_12px_rgba(249,115,22,0.35)]`}
    >
      <defs>
        {/* Main C-Arc Gradient */}
        <linearGradient id="cArcGrad" x1="40" y1="20" x2="160" y2="170" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" /> {/* Gold */}
          <stop offset="45%" stopColor="#F97316" /> {/* Warm Orange */}
          <stop offset="85%" stopColor="#E11D48" /> {/* Hot Red-Pink */}
          <stop offset="100%" stopColor="#BE123C" />
        </linearGradient>

        {/* Text Gradient */}
        <linearGradient id="mateTextGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#FB923C" />
          <stop offset="50%" stopColor="#F43F5E" />
          <stop offset="100%" stopColor="#E11D48" />
        </linearGradient>

        <linearGradient id="dotsGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#FB7185" />
        </linearGradient>

        {/* Film Strip Mask for Rectangular Slots */}
        <mask id="filmStripSlots">
          <rect width="200" height="200" fill="white" />
          {/* Punch holes out along top and bottom arc */}
          <rect x="78" y="24" width="8" height="6" rx="1" fill="black" transform="rotate(-65 82 27)" />
          <rect x="94" y="20" width="8" height="6" rx="1" fill="black" transform="rotate(-45 98 23)" />
          <rect x="114" y="21" width="8" height="6" rx="1" fill="black" transform="rotate(-25 118 24)" />
          <rect x="132" y="27" width="8" height="6" rx="1" fill="black" transform="rotate(-5 136 30)" />
          <rect x="146" y="38" width="8" height="6" rx="1" fill="black" transform="rotate(15 150 41)" />
          
          <rect x="136" y="132" width="8" height="6" rx="1" fill="black" transform="rotate(65 140 135)" />
          <rect x="118" y="142" width="8" height="6" rx="1" fill="black" transform="rotate(45 122 145)" />
          <rect x="98" y="146" width="8" height="6" rx="1" fill="black" transform="rotate(25 102 149)" />
          <rect x="78" y="142" width="8" height="6" rx="1" fill="black" transform="rotate(5 82 145)" />
        </mask>
      </defs>

      {/* Main Outer C-Shape + Speech Bubble Pointer */}
      <path
        d="M 138 34 
           C 118 18, 72 18, 48 48 
           C 24 78, 24 118, 50 142
           L 40 162 
           L 68 154
           C 88 164, 122 162, 142 142
           C 152 132, 158 120, 158 120
           L 142 110
           C 142 110, 138 120, 128 128
           C 112 142, 82 142, 66 128
           C 48 110, 48 78, 66 60
           C 82 44, 112 44, 126 56
           Z"
        fill="url(#cArcGrad)"
        mask="url(#filmStripSlots)"
      />

      {/* Center Film Reel (Cream Ivory Color) */}
      <g transform="translate(98, 88)">
        {/* Outer Reel Outer Ring */}
        <circle cx="0" cy="0" r="35" fill="#FFF8EE" />
        <circle cx="0" cy="0" r="30" fill="#0a0a0c" />
        <circle cx="0" cy="0" r="28" fill="#FFF8EE" />

        {/* 5 Circular Cutouts in the Reel */}
        <circle cx="0" cy="-16" r="7.5" fill="#0a0a0c" />
        <circle cx="15.2" cy="-5" r="7.5" fill="#0a0a0c" />
        <circle cx="9.4" cy="13" r="7.5" fill="#0a0a0c" />
        <circle cx="-9.4" cy="13" r="7.5" fill="#0a0a0c" />
        <circle cx="-15.2" cy="-5" r="7.5" fill="#0a0a0c" />

        {/* Center Hub */}
        <circle cx="0" cy="0" r="6" fill="#0a0a0c" />
        <circle cx="0" cy="0" r="2.5" fill="#FFF8EE" />
        {/* Tiny spindle pin holes */}
        <circle cx="0" cy="-4" r="0.8" fill="#FFF8EE" />
        <circle cx="4" cy="0" r="0.8" fill="#FFF8EE" />
        <circle cx="0" cy="4" r="0.8" fill="#FFF8EE" />
        <circle cx="-4" cy="0" r="0.8" fill="#FFF8EE" />
      </g>

      {/* 3 Horizontal Gradient Dots on Right */}
      <circle cx="154" cy="88" r="5.5" fill="#F97316" />
      <circle cx="169" cy="88" r="5.5" fill="#FB7185" />
      <circle cx="184" cy="88" r="5.5" fill="#F43F5E" />
    </svg>
  );
};

export const CineMateLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showTagline = true,
}) => {
  const iconSizes = {
    sm: "w-7 h-7",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-28 h-28",
  };

  const textSizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl",
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Icon Mark */}
      <CineMateIcon className={iconSizes[size]} />

      {/* Wordmark: CineMate */}
      <div className={`font-black tracking-tight mt-1.5 flex items-center justify-center ${textSizes[size]}`}>
        <span className="text-[#FFF8EE] font-sans">Cine</span>
        <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 bg-clip-text text-transparent font-sans">
          Mate
        </span>
      </div>

      {/* Tagline & Popcorn Decorator */}
      {showTagline && (
        <div className="mt-2 flex flex-col items-center gap-1.5">
          <p className="text-[10px] sm:text-xs font-mono font-bold text-slate-400 tracking-[0.2em] uppercase">
            Talk Movies. Feel Every Scene.
          </p>
          <div className="flex items-center gap-2 mt-0.5 opacity-80">
            <span className="h-[1px] w-8 bg-gradient-to-r from-transparent to-amber-500" />
            <span className="text-xs">🍿</span>
            <span className="h-[1px] w-8 bg-gradient-to-l from-transparent to-rose-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export const CineMateHeaderBrand: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer">
      <div className="relative flex items-center justify-center p-1 rounded-xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 group-hover:border-amber-500/40 transition-all shadow-[0_0_15px_rgba(249,115,22,0.2)]">
        <CineMateIcon className={size === 'sm' ? "w-7 h-7" : "w-8 h-8 sm:w-9 sm:h-9"} />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <h1 className="text-base sm:text-lg font-black tracking-tight font-sans leading-none">
            <span className="text-[#FFF8EE]">Cine</span>
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 bg-clip-text text-transparent">
              Mate
            </span>
          </h1>
          <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_8px_#10b981] animate-pulse" title="CineMate Online" />
        </div>
        <p className="text-[9px] sm:text-[10px] font-mono text-amber-400/90 font-bold tracking-widest hidden xs:block">
          TALK MOVIES. FEEL EVERY SCENE.
        </p>
      </div>
    </div>
  );
};
