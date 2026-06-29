import React from "react";

/**
 * Premium Dark Glass Input Component
 */
export const Input = React.forwardRef(({
  label,
  error,
  addon,
  type = "text",
  className = "",
  ...props
}, ref) => {
  return (
    <div className="flex flex-col w-full gap-1.5">
      {label && (
        <label className="text-[10px] font-bold tracking-wider uppercase text-orange-accent">
          {label}
        </label>
      )}
      
      <div className="relative flex items-center w-full">
        <input
          ref={ref}
          type={type}
          className={`w-full bg-charcoal/5 backdrop-blur-md border border-orange-accent/15 focus:border-orange-accent text-charcoal placeholder:text-gray-400 font-medium py-3 px-4 rounded-xl outline-none transition-all duration-200 shadow-sm ${
            addon ? "pr-14" : ""
          } ${
            error ? "border-red-400 focus:border-red-400" : ""
          } ${className}`}
          {...props}
        />
        
        {addon && (
          <span className="absolute right-4 font-bold text-xs uppercase text-orange-accent select-none pointer-events-none">
            {addon}
          </span>
        )}
      </div>

      {error && (
        <span className="text-[10px] text-red-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;
