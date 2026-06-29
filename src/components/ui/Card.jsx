import React from "react";
import { motion } from "framer-motion";

/**
 * Premium 3D Card Component with 5 Gradient Tints and Glassmorphism
 * @param {object} props - Card props
 * @param {number} props.tint - 1 to 5 for specific gradient card tints
 * @param {boolean} props.hover3d - Enable 3D hover tilt & lift
 * @param {boolean} props.glass - Enable default orange-bordered glassmorphism
 * @param {boolean} props.darkGlass - Enable dark navigation glassmorphism
 */
export const Card = ({ 
  children, 
  className = "", 
  tint,
  hover3d = false,
  glass = false,
  darkGlass = false,
  onClick,
  ...props 
}) => {
  let styleClass = "";
  
  if (tint === 1) styleClass = "card-tint-1";
  else if (tint === 2) styleClass = "card-tint-2";
  else if (tint === 3) styleClass = "card-tint-3";
  else if (tint === 4) styleClass = "card-tint-4";
  else if (tint === 5) styleClass = "card-tint-5";
  else if (glass) styleClass = "glass-light";
  else if (darkGlass) styleClass = "glass-dark";
  else styleClass = "bg-white border border-gray-100/50 shadow-[0_2px_12px_rgba(0,0,0,0.07)]";

  // Rounded: 20px
  const baseStyle = `${styleClass} rounded-[20px] p-5 transition-all duration-300 relative overflow-hidden`;

  if (hover3d && !props.disabled) {
    return (
      <motion.div
        onClick={onClick}
        style={{ perspective: 1000 }}
        whileHover={{ 
          rotateX: 2, 
          y: -8,
          boxShadow: "0 20px 40px rgba(0,0,0,0.06)",
        }}
        whileTap={onClick ? { scale: 0.98, y: -2 } : {}}
        className={`${baseStyle} ${onClick ? "cursor-pointer" : ""} ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div 
      onClick={onClick}
      className={`${baseStyle} ${onClick ? "cursor-pointer active:scale-[0.99] active:translate-y-px" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
