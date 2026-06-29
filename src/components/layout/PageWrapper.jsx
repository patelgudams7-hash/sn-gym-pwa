import React from "react";
import { motion } from "framer-motion";

export const PageWrapper = ({ children, className = "" }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full max-w-md mx-auto px-5 pt-4 pb-24 min-h-[calc(100vh-4rem)] flex flex-col gap-6 ${className}`}
    >
      {children}
    </motion.div>
  );
};

export default PageWrapper;
