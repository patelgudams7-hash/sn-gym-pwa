import React from "react";

/**
 * Reusable Premium Badge Component
 * @param {object} props 
 * @param {string} props.variant - 'beginner', 'intermediate', 'advanced', 'orange', 'neutral'
 */
export const Badge = ({ 
  children, 
  variant = "neutral", 
  className = "" 
}) => {
  const baseStyle = "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border transition-all duration-300";
  
  const variants = {
    beginner: "bg-emerald-50 text-emerald-700 border-emerald-100",
    intermediate: "bg-amber-50 text-amber-700 border-amber-200",
    advanced: "bg-red-50 text-red-700 border-red-150",
    orange: "bg-[#FFF5F0] text-orange-accent border-orange-100",
    neutral: "bg-gray-50 text-gray-600 border-gray-200"
  };

  const getVariant = (variantStr) => {
    const val = variantStr.toLowerCase();
    if (val.includes("begin")) return "beginner";
    if (val.includes("intermed")) return "intermediate";
    if (val.includes("advanc")) return "advanced";
    if (val.includes("orange") || val.includes("gold") || val.includes("accent")) return "orange";
    if (variants[val]) return val;
    return "neutral";
  };

  return (
    <span className={`${baseStyle} ${variants[getVariant(variant)]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
