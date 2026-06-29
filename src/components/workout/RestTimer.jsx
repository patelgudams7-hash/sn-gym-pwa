import React from "react";
import { Play, Pause, Square, Plus } from "lucide-react";
import Button from "../ui/Button";

/**
 * Premium Dark Glass Rest Timer with SVG ring progress animating down
 */
export const RestTimer = ({
  timeLeft,
  duration,
  isActive,
  percentage,
  onPause,
  onResume,
  onSkip,
  onAddSeconds
}) => {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-5">
      <div className="glass-dark border border-orange-accent/30 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[28px] p-6 w-full max-w-sm flex flex-col items-center gap-6 text-white">
        <div className="text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Rest Period</span>
          <h3 className="font-heading text-2xl font-bold tracking-wider text-white mt-1 uppercase">Recover & Prepare</h3>
        </div>

        {/* Circular SVG Timer with orange gradient path */}
        <div className="relative w-36 h-36 flex items-center justify-center select-none">
          <svg className="w-full h-full transform -rotate-90">
            {/* Background Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="#2e2e2e"
              strokeWidth="8"
              fill="transparent"
            />
            {/* Foreground Orange Ring */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#orangeTimerGradient)"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-linear"
            />
            {/* Gradients */}
            <defs>
              <linearGradient id="orangeTimerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FF6B00" />
                <stop offset="50%" stopColor="#FF8533" />
                <stop offset="100%" stopColor="#FF6B00" />
              </linearGradient>
            </defs>
          </svg>

          {/* Centered Countdown Numbers in Bebas Neue */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="font-heading text-4xl font-extrabold text-white">
              {timeLeft}
            </span>
            <span className="text-[9px] text-white/50 font-bold uppercase tracking-widest">
              Seconds
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col w-full gap-3">
          <div className="flex gap-3 justify-center">
            {/* Add 15s Button */}
            <Button
              variant="secondary"
              onClick={() => onAddSeconds(15)}
              className="py-2.5 px-4 font-bold text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-white flex-1"
            >
              <Plus size={14} />
              <span>+15s</span>
            </Button>

            {/* Play / Pause Toggle */}
            {isActive ? (
              <Button
                variant="primary"
                onClick={onPause}
                className="py-2.5 px-5 font-bold text-xs flex-1"
              >
                <Pause size={14} />
                <span>Pause</span>
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={onResume}
                className="py-2.5 px-5 font-bold text-xs flex-1"
              >
                <Play size={14} className="fill-white" />
                <span>Resume</span>
              </Button>
            )}
          </div>

          {/* Skip / Stop button */}
          <button
            onClick={onSkip}
            className="w-full py-3 bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 font-bold text-xs rounded-full flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Square size={12} className="fill-white/70" />
            <span>Skip Rest</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestTimer;
