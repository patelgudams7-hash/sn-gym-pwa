import React from "react";

// SN Gym Logo with dumbbell SVG — gradient orange to amber
export const SNGymLogo = ({ size = 80, className = "" }) => (
  <div className={`flex flex-col items-center gap-2 ${className}`}>
    <img 
      src="/logo-barbell.jpg" 
      alt="SN GYM" 
      style={{ width: size, height: size }}
      className="object-contain"
    />
    <div className="flex flex-col items-center leading-none mt-1">
      <span
        className="font-heading tracking-widest text-[#1a1a1a] font-black"
        style={{
          fontSize: size * 0.42,
        }}
      >
        SN GYM
      </span>
      <span
        className="font-sans font-semibold tracking-[0.35em] uppercase text-orange-accent"
        style={{
          fontSize: size * 0.13,
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
    <img 
      src="/logo-barbell.jpg" 
      alt="SN GYM" 
      style={{ width: size, height: size }}
      className="object-contain"
    />
    <span
      className="font-heading tracking-wider text-[#1a1a1a] font-black"
      style={{
        fontSize: size * 0.5,
      }}
    >
      SN GYM
    </span>
  </div>
);

export default SNGymLogo;
