import React from "react";
import { calculateBMI } from "../../utils/bmi";

export const MeasurementGauge = ({ weight, height }) => {
  const { bmi, category, color, gaugePercent } = calculateBMI(weight, height);

  // Map 0-100 percentage to -90deg to +90deg rotation
  const angle = (gaugePercent / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center gap-4 py-4 w-full">
      {/* Gauge Container */}
      <div className="relative w-48 h-24 select-none">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          {/* Semi-circular color tracks */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke="#f0f0f0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Colored Active Arc representing the classification */}
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray="157" // circumference of semi-circle (pi * r) => 3.14 * 50 = 157
            strokeDashoffset={157 - (gaugePercent / 100) * 157}
            className="transition-all duration-1000 ease-out"
          />

          {/* Center Point */}
          <circle cx="60" cy="55" r="4.5" fill="#FF6B00" />

          {/* Needle Pointer - Orange Needle */}
          <line
            x1="60"
            y1="55"
            x2="60"
            y2="15"
            stroke="#FF6B00"
            strokeWidth="3.5"
            strokeLinecap="round"
            style={{
              transform: `rotate(${angle}deg)`,
              transformOrigin: "60px 55px",
              transition: "transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)"
            }}
          />
        </svg>

        {/* Labels left and right */}
        <span className="absolute bottom-0 left-1.5 text-[8px] font-bold text-gray-400">10.0</span>
        <span className="absolute bottom-0 right-1.5 text-[8px] font-bold text-gray-400">40.0</span>
      </div>

      {/* Legend & Summary Info */}
      <div className="text-center flex flex-col gap-0.5">
        <span className="text-[10px] uppercase font-bold tracking-widest text-gray-400">Current BMI</span>
        <div className="flex items-baseline justify-center gap-1.5">
          <span className="font-heading text-4xl font-extrabold text-charcoal leading-none">
            {bmi || "--"}
          </span>
          <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100" style={{ color }}>
            {category}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MeasurementGauge;
