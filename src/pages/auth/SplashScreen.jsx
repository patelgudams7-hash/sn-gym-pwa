import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState(0); // 0=show, 1=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 2400);
    const t2 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center overflow-hidden bg-white select-none">
      {/* Full-screen Splash Background Image */}
      <img 
        src="/splash-bg.png" 
        alt="Loading SN Gym" 
        className="w-full h-full object-cover absolute inset-0"
      />

      {/* Animated Spinner Overlay on top of the image spinner */}
      <div className="absolute bottom-[18%] flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-orange-accent border-t-transparent rounded-full animate-spin shadow-md" />
      </div>

      {/* Exit fade overlay */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 1 ? 1 : 0 }}
        transition={{ duration: 0.55 }}
      />
    </div>
  );
};

export default SplashScreen;
