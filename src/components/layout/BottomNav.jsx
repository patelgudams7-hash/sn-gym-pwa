import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutGrid, Dumbbell, Plus, UtensilsCrossed, CircleUser } from "lucide-react";
import { motion } from "framer-motion";

export const BottomNav = ({ onCenterPlusClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;

  const tabs = [
    { name: "Home", path: "/", icon: LayoutGrid },
    { name: "Exercises", path: "/library", icon: Dumbbell },
    { name: "CenterPlus", isCenter: true },
    { name: "Diet", path: "/diet", icon: UtensilsCrossed },
    { name: "Profile", path: "/profile", icon: CircleUser }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto px-4 pb-4 pointer-events-none">
      <nav 
        className="w-full h-20 bg-white/60 backdrop-blur-2xl saturate-200 border border-white/80 rounded-full shadow-[0_10px_32px_rgba(0,0,0,0.06),inset_0_1px_1px_rgba(255,255,255,0.35)] flex items-center justify-around px-2 pointer-events-auto"
      >
        {tabs.map((tab) => {
          if (tab.isCenter) {
            return (
              <button
                key="center-plus"
                onClick={onCenterPlusClick}
                className="w-13 h-13 rounded-full bg-linear-to-r from-orange-accent to-[#FF9500] flex items-center justify-center text-white shadow-[0_8px_20px_rgba(255,107,0,0.4)] hover:scale-105 active:scale-95 transition-all duration-200 -mt-7 cursor-pointer z-50 select-none border border-white/20"
              >
                <Plus size={28} strokeWidth={2.5} />
              </button>
            );
          }

          const Icon = tab.icon;
          const isActive = activePath === tab.path;

          return (
            <button
              key={tab.name}
              onClick={() => navigate(tab.path)}
              className="flex items-center justify-center flex-1 h-[75%] relative cursor-pointer outline-none select-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeBubble"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  className="absolute inset-x-1.5 inset-y-0.5 bg-orange-accent/10 border border-orange-accent/20 rounded-full z-0"
                />
              )}
              
              <div className="flex flex-col items-center justify-center gap-0.5 z-10">
                <motion.div
                  animate={{ scale: isActive ? 1.08 : 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon 
                    size={20} 
                    strokeWidth={isActive ? 2.5 : 2}
                    fill={isActive ? "currentColor" : "none"}
                    className={`transition-colors duration-200 ${
                      isActive ? "text-orange-accent" : "text-[#8E8E93]"
                    }`}
                  />
                </motion.div>
                <span 
                  className={`text-[8.5px] font-black tracking-wide transition-colors duration-200 ${
                    isActive ? "text-orange-accent" : "text-[#8E8E93]"
                  }`}
                >
                  {tab.name}
                </span>
              </div>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
