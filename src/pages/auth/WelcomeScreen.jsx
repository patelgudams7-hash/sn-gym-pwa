import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SNGymLogo from "../../components/brand/SNGymLogo";
import { Flame, Dumbbell, Apple } from "lucide-react";

const features = [
  { icon: Dumbbell, label: "Smart Workouts", desc: "AI-powered plans built for you" },
  { icon: Flame, label: "Calorie Tracking", desc: "Personalised Indian diet programs" },
  { icon: Apple, label: "APEX Coach", desc: "Your 24/7 fitness trainer" }
];

const WelcomeScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-transparent">
      {/* Top hero gradient */}
      <div
        className="absolute top-0 left-0 right-0"
        style={{
          height: "55%",
          background: "linear-gradient(160deg, #FF6B00 0%, #FF9A3C 45%, #FFD166 100%)",
          borderBottomLeftRadius: "40%",
          borderBottomRightRadius: "40%"
        }}
      />

      {/* Decorative circles */}
      <div className="absolute -top-15 -right-15 w-56 h-56 rounded-full opacity-20 bg-white" />
      <div className="absolute top-5 -left-10 w-32 h-32 rounded-full opacity-15 bg-white" />

      <div className="relative z-10 flex flex-col items-center px-6 pt-14 pb-10 flex-1">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, type: "spring", damping: 18 }}
        >
          <div className="bg-white/20 backdrop-blur rounded-[28px] p-5 shadow-2xl">
            <SNGymLogo size={72} className="[&_span]:text-white [&_span]:[-webkit-text-fill-color:white]" />
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div
          className="mt-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h1 className="text-white text-3xl font-black leading-tight">
            Transform Your<br />Body. Elevate<br />Your Life.
          </h1>
          <p className="mt-3 text-white/80 text-sm font-medium">
            The smartest gym companion designed for serious athletes.
          </p>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          className="mt-10 flex flex-col gap-3 w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          {features.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45 + i * 0.1, type: "spring", damping: 20 }}
              className="flex items-center gap-4 bg-white rounded-2xl px-4 py-3 shadow-sm border border-orange-50"
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #FF6B00, #FFD166)" }}
              >
                <Icon size={18} className="text-white" />
              </div>
              <div>
                <p className="font-bold text-charcoal text-sm">{label}</p>
                <p className="text-gray-500 text-xs font-medium">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* CTA buttons */}
        <motion.div
          className="w-full flex flex-col gap-3"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-4 rounded-2xl text-white font-black text-base tracking-wide shadow-lg active:scale-95 transition-transform cursor-pointer"
            style={{ background: "linear-gradient(135deg, #FF6B00 0%, #FF9A3C 100%)" }}
          >
            Get Started — It's Free
          </button>
          <button
            onClick={() => navigate("/login")}
            className="w-full py-3.5 rounded-2xl font-bold text-sm border-2 text-charcoal bg-white active:scale-95 transition-transform cursor-pointer"
            style={{ borderColor: "#FF6B00" }}
          >
            Already have an account? <span style={{ color: "#FF6B00" }}>Log In</span>
          </button>
        </motion.div>

        <p className="mt-5 text-xs text-gray-400 text-center font-medium">
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
