import React from "react";
import { motion } from "framer-motion";

/**
 * Premium 3D Orange Button Component
 * @param {object} props - Button props
 * @param {string} props.variant - 'primary', 'secondary', 'ghost', 'danger'
 * @param {boolean} props.fullWidth - If true, stretches button to full width
 */
export const Button = React.forwardRef(({ 
  children, 
  variant = "primary", 
  fullWidth = false, 
  className = "", 
  disabled = false,
  onClick,
  ...props 
}, ref) => {
  
  const baseStyle = "relative overflow-hidden font-sans font-bold tracking-wide text-xs py-3.5 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none outline-none btn-3d";
  
  const variants = {
    primary: "bg-linear-to-r from-orange-accent via-[#FF8533] to-orange-accent text-white shadow-[0_4px_15px_rgba(255,107,0,0.25)] hover:shadow-[0_8px_25px_rgba(255,107,0,0.4)]",
    secondary: "bg-[#F0F0F0] text-[#1A1A1A] border border-gray-200 hover:bg-[#e4e4e4]",
    ghost: "bg-white/80 text-[#FF6B00] border border-orange-200 backdrop-blur-md hover:bg-orange-50/50",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100/70"
  };

  const widthStyle = fullWidth ? "w-full" : "w-auto";

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? {} : { y: -2 }}
      whileTap={disabled ? {} : { y: 1, scale: 0.98 }}
      className={`${baseStyle} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
});

Button.displayName = "Button";
export default Button;
