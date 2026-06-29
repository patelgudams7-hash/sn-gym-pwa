import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

/**
 * Premium Dark Glass Modal / Bottom Sheet Component (rounded: 28px)
 */
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  className = "",
  theme = "dark" // "dark" | "light"
}) => {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md"
          />

          {/* Modal Container: 28px border-radius */}
          <motion.div
            initial={{ y: "100%", opacity: 0.5 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.5 }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            className={`relative z-10 w-full max-w-lg rounded-t-[28px] sm:rounded-[28px] flex flex-col max-h-[85vh] sm:max-h-[80vh] overflow-hidden ${
              theme === "light"
                ? "bg-white text-charcoal border border-gray-200 shadow-2xl"
                : "glass-dark text-white"
            } ${className}`}
          >
            {/* Grab handle for mobile bottom sheets */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className={`w-12 h-1.5 rounded-full ${theme === "light" ? "bg-charcoal/20" : "bg-white/20"}`} />
            </div>

            {/* Header */}
            <div className={`flex items-center justify-between px-6 py-4 border-b ${theme === "light" ? "border-gray-100" : "border-white/10"}`}>
              {title && (
                <h3 className={`font-heading text-2xl font-bold tracking-wider uppercase ${theme === "light" ? "text-charcoal" : "text-white"}`}>
                  {title}
                </h3>
              )}
              <button
                onClick={onClose}
                className={`p-2 -mr-2 rounded-full transition-colors cursor-pointer ${
                  theme === "light"
                    ? "text-charcoal/60 hover:text-orange-accent hover:bg-charcoal/5"
                    : "text-white/60 hover:text-orange-accent hover:bg-white/5"
                }`}
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
