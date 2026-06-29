import React from "react";
import { useNavigate } from "react-router-dom";
import { Plus, LayoutTemplate, Bookmark, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const CenterPlusMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const options = [
    {
      title: "New Workout",
      subtitle: "Build a custom session from scratch",
      icon: Plus,
      color: "bg-orange-100 text-orange-accent",
      path: "/builder"
    },
    {
      title: "Choose Template",
      subtitle: "Select from curated training routines",
      icon: LayoutTemplate,
      color: "bg-purple-100 text-purple-600",
      path: "/plans"
    },
    {
      title: "Saved Routines",
      subtitle: "Access your custom saved plans",
      icon: Bookmark,
      color: "bg-blue-100 text-blue-600",
      path: "/plans"
    }
  ];

  const handleSelect = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Semi-transparent overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#1a1a1a] z-50 pointer-events-auto"
          />

          {/* Bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-[28px] shadow-[0_-8px_32px_rgba(0,0,0,0.15)] z-50 px-6 pt-5 pb-8 pointer-events-auto"
          >
            {/* Grabber line */}
            <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

            <div className="flex items-center justify-between mb-6">
              <h3 className="font-sans text-xl font-bold text-[#1a1a1a]">Start Workout</h3>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 active:scale-90 transition-transform cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col gap-4">
              {options.map((opt, i) => {
                const Icon = opt.icon;
                return (
                  <motion.button
                    key={opt.title}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => handleSelect(opt.path)}
                    className="w-full flex items-center gap-4 p-4 bg-white border border-gray-100 rounded-[20px] text-left hover:border-orange-100 hover:shadow-xs active:scale-[0.98] transition-all cursor-pointer"
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 fill-current bg-orange-100 text-orange-accent">
                      <Icon size={24} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-sans font-bold text-sm text-[#1a1a1a]">{opt.title}</h4>
                      <p className="font-sans text-xs text-gray-500 mt-0.5">{opt.subtitle}</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CenterPlusMenu;
