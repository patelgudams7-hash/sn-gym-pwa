import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import SNGymLogo from "../../components/brand/SNGymLogo";

const SplashScreen = ({ onDone }) => {
  const [phase, setPhase] = useState(0); // 0=logo, 1=tagline, 2=exit

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => setPhase(2), 2400);
    const t3 = setTimeout(() => onDone(), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center overflow-hidden">
      {/* Animated gradient background */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          background: "linear-gradient(160deg, #0f0f0f 0%, #1a0800 40%, #2d1200 70%, #0f0f0f 100%)"
        }}
      />

      {/* Radial glow behind logo */}
      <motion.div
        className="absolute"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: phase >= 0 ? 1 : 0, opacity: phase >= 0 ? 1 : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          width: 320,
          height: 320,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(255,107,0,0.35) 0%, rgba(255,107,0,0.08) 55%, transparent 80%)"
        }}
      />

      {/* Spinning ring */}
      <motion.div
        className="absolute"
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{
          width: 220,
          height: 220,
          borderRadius: "50%",
          border: "1.5px solid transparent",
          background: "linear-gradient(#0f0f0f, #0f0f0f) padding-box, linear-gradient(135deg, #FF6B00, #FFD166, #FF3C00, #FF6B00) border-box"
        }}
      />

      {/* Content */}
      <div className="relative flex flex-col items-center gap-6 z-10">
        <motion.div
          initial={{ scale: 0.4, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.7, type: "spring", damping: 18 }}
        >
          <SNGymLogo size={90} />
        </motion.div>

        <motion.p
          className="text-center font-sans font-medium tracking-widest uppercase text-xs"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: phase >= 1 ? 1 : 0, y: phase >= 1 ? 0 : 10 }}
          transition={{ duration: 0.5 }}
          style={{ color: "rgba(255,154,60,0.75)", letterSpacing: "0.3em" }}
        >
          Your Elite Fitness Journey
        </motion.p>

        {/* Loading dots */}
        <motion.div
          className="flex gap-1.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 1 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
        >
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: "#FF6B00" }}
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1, delay: i * 0.18, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </div>

      {/* Exit fade overlay */}
      <motion.div
        className="absolute inset-0 bg-white pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase >= 2 ? 1 : 0 }}
        transition={{ duration: 0.55 }}
      />
    </div>
  );
};

export default SplashScreen;
