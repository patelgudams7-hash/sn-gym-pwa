import React, { useState } from "react";
import { Dumbbell } from "lucide-react";

/**
 * Rebuilt Premium GIF Player (1:1 aspect ratio, cover fit)
 */
export const GifPlayer = ({ gifUrl, altName, className = "" }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className={`relative w-full aspect-square rounded-2xl overflow-hidden bg-gray-50 border border-orange-accent/15 flex items-center justify-center shadow-md ${className}`}>
      {/* Loading Skeleton */}
      {loading && !error && (
        <div className="absolute inset-0 bg-linear-to-r from-gray-100 via-gray-50 to-gray-100 animate-pulse flex flex-col items-center justify-center gap-2">
          <Dumbbell size={32} className="text-orange-accent/40 animate-bounce" />
          <span className="text-[10px] text-gray-400 font-bold tracking-wider uppercase">Loading APEX Demo...</span>
        </div>
      )}

      {/* Fallback Error View (Show name + icon) */}
      {error || !gifUrl ? (
        <div className="absolute inset-0 bg-[#FFF5F0] flex flex-col items-center justify-center p-5 text-center gap-3">
          <div className="w-14 h-14 rounded-full border border-orange-100 bg-white flex items-center justify-center text-orange-accent shadow-sm animate-pulse">
            <Dumbbell size={28} />
          </div>
          <span className="font-heading text-lg font-bold text-charcoal tracking-wide uppercase max-w-[90%] leading-tight">
            {altName || "Exercise"}
          </span>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">No Video Preview Available</p>
        </div>
      ) : (
        /* Image tag (GIF) with aspect ratio 1:1, cover, no black bars */
        <img
          src={gifUrl}
          alt={altName || "Exercise Demonstration"}
          onLoad={handleLoad}
          onError={handleError}
          className={`w-full h-full object-cover object-center transition-opacity duration-300 ${
            loading ? "opacity-0" : "opacity-100"
          }`}
        />
      )}
    </div>
  );
};

export default GifPlayer;
