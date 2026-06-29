import React from "react";

// SN Gym Logo with dumbbell SVG — gradient orange to amber
export const SNGymLogo = ({ size = 80, className = "" }) => (
  <div className={`flex flex-col items-center gap-2 ${className}`}>
    {/* Dumbbell icon with gradient */}
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="dbGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="50%" stopColor="#FF9A3C" />
          <stop offset="100%" stopColor="#FFD166" />
        </linearGradient>
        <linearGradient id="dbGrad2" x1="80" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#FF3C00" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Glow circle background */}
      <circle cx="40" cy="40" r="38" fill="url(#dbGrad)" opacity="0.12" />
      <circle cx="40" cy="40" r="30" fill="url(#dbGrad)" opacity="0.08" />

      {/* Dumbbell bar */}
      <rect x="16" y="37" width="48" height="6" rx="3" fill="url(#dbGrad)" filter="url(#glow)" />

      {/* Left weight plate outer */}
      <rect x="6" y="28" width="12" height="24" rx="5" fill="url(#dbGrad2)" filter="url(#glow)" />
      {/* Left weight plate inner */}
      <rect x="9" y="31" width="6" height="18" rx="3" fill="url(#dbGrad)" />

      {/* Right weight plate outer */}
      <rect x="62" y="28" width="12" height="24" rx="5" fill="url(#dbGrad2)" filter="url(#glow)" />
      {/* Right weight plate inner */}
      <rect x="65" y="31" width="6" height="18" rx="3" fill="url(#dbGrad)" />

      {/* Left collar */}
      <rect x="18" y="33" width="7" height="14" rx="2.5" fill="url(#dbGrad2)" />
      {/* Right collar */}
      <rect x="55" y="33" width="7" height="14" rx="2.5" fill="url(#dbGrad2)" />
    </svg>

    {/* Text logo */}
    <div className="flex flex-col items-center leading-none">
      <span
        className="font-heading tracking-widest text-transparent bg-clip-text"
        style={{
          fontSize: size * 0.42,
          backgroundImage: "linear-gradient(135deg, #FF6B00 0%, #FF9A3C 50%, #FFD166 100%)"
        }}
      >
        SN GYM
      </span>
      <span
        className="font-sans font-semibold tracking-[0.35em] uppercase text-transparent bg-clip-text"
        style={{
          fontSize: size * 0.13,
          backgroundImage: "linear-gradient(135deg, #FF9A3C, #FF6B00)"
        }}
      >
        Elite Fitness
      </span>
    </div>
  </div>
);

// Compact inline logo for headers
export const SNGymLogoMini = ({ size = 36 }) => (
  <div className="flex items-center gap-2">
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="miniGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FF6B00" />
          <stop offset="100%" stopColor="#FFD166" />
        </linearGradient>
      </defs>
      <rect x="16" y="37" width="48" height="6" rx="3" fill="url(#miniGrad)" />
      <rect x="6" y="28" width="12" height="24" rx="5" fill="url(#miniGrad)" />
      <rect x="62" y="28" width="12" height="24" rx="5" fill="url(#miniGrad)" />
      <rect x="18" y="33" width="7" height="14" rx="2.5" fill="#FF6B00" />
      <rect x="55" y="33" width="7" height="14" rx="2.5" fill="#FF6B00" />
    </svg>
    <span
      className="font-heading tracking-wider text-transparent bg-clip-text"
      style={{
        fontSize: size * 0.5,
        backgroundImage: "linear-gradient(135deg, #FF6B00, #FFD166)"
      }}
    >
      SN GYM
    </span>
  </div>
);

export default SNGymLogo;
