import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
}

export const CineMateIcon: React.FC<{ className?: string; animated?: boolean }> = ({ 
  className = "w-8 h-8",
  animated = false
}) => {
  return (
    <svg
      viewBox="0 0 240 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className} shrink-0 drop-shadow-[0_0_18px_rgba(245,158,11,0.4)] ${
        animated ? 'hover:scale-105 transition-transform duration-300' : ''
      }`}
    >
      <defs>
        {/* Outer Glowing Lens & Ribbon Gradients */}
        <linearGradient id="goldCrimsonGrad" x1="20" y1="20" x2="220" y2="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF176" />   {/* Radiant Gold */}
          <stop offset="25%" stopColor="#F59E0B" />  {/* Golden Amber */}
          <stop offset="55%" stopColor="#F97316" />  {/* Warm Orange */}
          <stop offset="85%" stopColor="#E11D48" />  {/* Crimson Rose */}
          <stop offset="100%" stopColor="#881337" /> {/* Deep Velvet Red */}
        </linearGradient>

        <linearGradient id="lensFlareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.9" /> {/* Anamorphic Cyan Flare */}
          <stop offset="50%" stopColor="#F43F5E" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
        </linearGradient>

        <linearGradient id="reelMetalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="20%" stopColor="#FDE68A" />
          <stop offset="60%" stopColor="#334155" />
          <stop offset="100%" stopColor="#0F172A" />
        </linearGradient>

        <linearGradient id="coreBeamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.8" />
          <stop offset="50%" stopColor="#EF4444" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.2" />
        </linearGradient>

        {/* Glow Filters */}
        <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <filter id="lightBeamBlur" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        {/* Film Strip Hole Mask for Curved C-Ribbon */}
        <mask id="filmPerforations">
          <rect width="240" height="240" fill="white" />
          {/* Top Arc Sprockets */}
          <rect x="92" y="28" width="9" height="7" rx="1.5" fill="black" transform="rotate(-62 96 31)" />
          <rect x="112" y="23" width="9" height="7" rx="1.5" fill="black" transform="rotate(-42 116 26)" />
          <rect x="135" y="23" width="9" height="7" rx="1.5" fill="black" transform="rotate(-20 139 26)" />
          <rect x="158" y="29" width="9" height="7" rx="1.5" fill="black" transform="rotate(2 162 32)" />
          <rect x="178" y="42" width="9" height="7" rx="1.5" fill="black" transform="rotate(22 182 45)" />
          <rect x="194" y="60" width="9" height="7" rx="1.5" fill="black" transform="rotate(42 198 63)" />

          {/* Bottom Arc Sprockets */}
          <rect x="182" y="156" width="9" height="7" rx="1.5" fill="black" transform="rotate(68 186 159)" />
          <rect x="160" y="176" width="9" height="7" rx="1.5" fill="black" transform="rotate(45 164 179)" />
          <rect x="135" y="186" width="9" height="7" rx="1.5" fill="black" transform="rotate(20 139 189)" />
          <rect x="110" y="186" width="9" height="7" rx="1.5" fill="black" transform="rotate(-2 114 189)" />
          <rect x="86" y="178" width="9" height="7" rx="1.5" fill="black" transform="rotate(-24 90 181)" />
        </mask>
      </defs>

      {/* Background Projector Light Cone / Anamorphic Beam */}
      <polygon
        points="120,120 220,70 235,170"
        fill="url(#coreBeamGrad)"
        filter="url(#lightBeamBlur)"
        opacity="0.7"
      />

      {/* Main Curved 3D Film Strip 'C' Shape */}
      <path
        d="M 168 38 
           C 140 18, 80 18, 52 52 
           C 22 86, 22 138, 54 168
           L 42 192 
           L 76 182
           C 98 196, 142 196, 168 172
           C 182 158, 192 142, 192 142
           L 172 130
           C 172 130, 166 142, 154 152
           C 134 170, 96 170, 76 152
           C 52 130, 52 92, 76 70
           C 98 50, 136 50, 154 66
           Z"
        fill="url(#goldCrimsonGrad)"
        mask="url(#filmPerforations)"
      />

      {/* Inner Metallic Lens Ring Frame */}
      <circle cx="120" cy="115" r="44" fill="#0A0A0E" stroke="url(#goldCrimsonGrad)" strokeWidth="3" />
      <circle cx="120" cy="115" r="40" fill="none" stroke="url(#lensFlareGrad)" strokeWidth="1.5" opacity="0.8" />

      {/* 3D Film Reel & Aperture Blades Core */}
      <g transform="translate(120, 115)">
        {/* Outer Reel Disk */}
        <circle cx="0" cy="0" r="32" fill="#12121A" stroke="#FDE68A" strokeWidth="1" />

        {/* 6 Curved Aperture Blades / Reel Cutouts */}
        {Array.from({ length: 6 }).map((_, i) => {
          const angle = (i * 60 * Math.PI) / 180;
          const x = Math.cos(angle) * 16;
          const y = Math.sin(angle) * 16;
          return (
            <path
              key={i}
              d={`M ${x} ${y} A 10 10 0 0 1 ${Math.cos(angle + 0.8) * 16} ${Math.sin(angle + 0.8) * 16} L 0 0 Z`}
              fill="#060608"
              stroke="url(#goldCrimsonGrad)"
              strokeWidth="0.8"
              opacity="0.95"
            />
          );
        })}

        {/* Inner Golden Hub */}
        <circle cx="0" cy="0" r="10" fill="url(#reelMetalGrad)" filter="url(#coreGlow)" />
        <circle cx="0" cy="0" r="4" fill="#060608" />

        {/* Center Glowing Play Spark Symbol */}
        <polygon points="-2,-4 5,0 -2,4" fill="#FDE047" />
      </g>

      {/* Anamorphic Blue Lens Flare Line Across Lens */}
      <line x1="60" y1="115" x2="180" y2="115" stroke="url(#lensFlareGrad)" strokeWidth="2" strokeLinecap="round" opacity="0.85" filter="url(#coreGlow)" />

      {/* 3 Floating Cinematic Spark Dots (Gold, Tangerine, Pink) */}
      <circle cx="192" cy="115" r="5" fill="#FDE047" filter="url(#coreGlow)" />
      <circle cx="210" cy="115" r="4" fill="#F97316" />
      <circle cx="224" cy="115" r="3" fill="#F43F5E" />
    </svg>
  );
};

export const CineMateLogo: React.FC<LogoProps> = ({
  className = "",
  size = "md",
  showTagline = true,
}) => {
  const iconSizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-32 h-32",
  };

  const textSizes = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-7xl",
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center ${className}`}>
      {/* Icon Mark */}
      <div className="relative group cursor-pointer">
        <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 rounded-full blur-xl opacity-30 group-hover:opacity-60 transition duration-500"></div>
        <CineMateIcon className={`${iconSizes[size]} relative`} animated />
      </div>

      {/* Wordmark: CineMate */}
      <div className={`font-black tracking-tight mt-2 flex items-center justify-center ${textSizes[size]}`}>
        <span className="text-[#FFF8EE] font-sans drop-shadow-md">Cine</span>
        <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 bg-clip-text text-transparent font-sans drop-shadow-[0_2px_10px_rgba(244,63,94,0.3)]">
          Mate
        </span>
      </div>

      {/* Tagline & Cinema Spark Decorator */}
      {showTagline && (
        <div className="mt-2.5 flex flex-col items-center gap-2">
          <p className="text-[10px] sm:text-xs font-mono font-bold text-amber-300/90 tracking-[0.25em] uppercase drop-shadow">
            Talk Movies. Feel Every Scene.
          </p>
          <div className="flex items-center gap-3 opacity-90">
            <span className="h-[1px] w-10 bg-gradient-to-r from-transparent via-amber-400 to-amber-500" />
            <span className="text-sm animate-pulse">🎬</span>
            <span className="h-[1px] w-10 bg-gradient-to-l from-transparent via-rose-400 to-rose-500" />
          </div>
        </div>
      )}
    </div>
  );
};

export const CineMateHeaderBrand: React.FC<{ size?: 'sm' | 'md' }> = ({ size = 'md' }) => {
  return (
    <div className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer">
      <div className="relative flex items-center justify-center p-1.5 rounded-2xl bg-gradient-to-b from-white/10 via-amber-500/5 to-transparent border border-white/10 group-hover:border-amber-500/50 transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] group-hover:shadow-[0_0_25px_rgba(245,158,11,0.4)]">
        <CineMateIcon className={size === 'sm' ? "w-8 h-8" : "w-9 h-9 sm:w-10 sm:h-10"} animated />
      </div>
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1 className="text-lg sm:text-xl font-black tracking-tight font-sans leading-none">
            <span className="text-[#FFF8EE] drop-shadow-sm">Cine</span>
            <span className="bg-gradient-to-r from-amber-400 via-rose-500 to-red-600 bg-clip-text text-transparent drop-shadow-[0_2px_8px_rgba(244,63,94,0.3)]">
              Mate
            </span>
          </h1>
          <span className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] animate-pulse" title="CineMate AI Active" />
        </div>
        <p className="text-[9px] sm:text-[10px] font-mono text-amber-400/90 font-bold tracking-[0.2em] uppercase hidden xs:block mt-0.5">
          TALK MOVIES. FEEL EVERY SCENE.
        </p>
      </div>
    </div>
  );
};

