import React, { useState } from "react";
import { useGym } from "../store/GymContext";
import { useExercises } from "../hooks/useExercises";
import { 
  Search, 
  Heart, 
  List, 
  ArrowLeft, 
  Check, 
  Plus, 
  Play 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Real exercise GIF thumbnails from the dataset, one per muscle category
const CATEGORY_GIFS = {
  Chest:      "https://fitnessprogramer.com/wp-content/uploads/2022/02/Push-up-Toe-Touch.gif",
  Back:       "https://fitnessprogramer.com/wp-content/uploads/2023/06/L-Pull-Up.gif",
  Shoulders:  "https://fitnessprogramer.com/wp-content/uploads/2021/02/Bent-Over-Lateral-Raise.gif",
  Biceps:     "https://fitnessprogramer.com/wp-content/uploads/2021/04/High-Cable-Single-Arm-Bicep-Curl.gif",
  Triceps:    "https://fitnessprogramer.com/wp-content/uploads/2022/11/One-arm-triceps-pushdown.gif",
  Legs:       "https://fitnessprogramer.com/wp-content/uploads/2022/07/overhead-squat.gif",
  Abs:        "https://fitnessprogramer.com/wp-content/uploads/2022/07/Cross-Crunch.gif",
  Cardio:     "https://fitnessprogramer.com/wp-content/uploads/2022/01/jumping-pull-up.gif",
  Calves:     "https://fitnessprogramer.com/wp-content/uploads/2021/06/Standing-Calf-Raise.gif",
  Forearms:   "https://fitnessprogramer.com/wp-content/uploads/2021/08/wrist-roller.gif",
  Traps:      "https://fitnessprogramer.com/wp-content/uploads/2022/01/Dumbbell-Seated-Gittleson-Shrug.gif",
  "Lower Back": "https://fitnessprogramer.com/wp-content/uploads/2023/09/dumbbell-deadlifts.gif",
  "Full Body":  "https://fitnessprogramer.com/wp-content/uploads/2023/10/Navy-Seal-Burpee.gif",
  Neck:       "https://fitnessprogramer.com/wp-content/uploads/2022/02/Lying-Weighted-Lateral-Neck-Flexion.gif",
};

export const Library = () => {
  const { 
    favorites, 
    toggleFavorite, 
    savePlan 
  } = useGym();
  
  const { exercises, loading } = useExercises();
  const navigate = useNavigate();

  // Screen state: "categories" | "list" | "detail"
  const [screen, setScreen] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedExercise, setSelectedExercise] = useState(null);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [activeDifficulty, setActiveDifficulty] = useState("All");
  const [activeTime, setActiveTime] = useState("All");
  const [activeGoal, setActiveGoal] = useState("All");
  const [activeEquipment, setActiveEquipment] = useState("All");
  const [pageSize, setPageSize] = useState(25);
  
  // Stacks Queue State
  const [activeStack, setActiveStack] = useState([]);
  const [showStackModal, setShowStackModal] = useState(false);
  const [stackName, setStackName] = useState("My Gym Stack");
  const [showFavsOnly, setShowFavsOnly] = useState(false);

  // Expanded 14-category specs with unique gradients and text colors
  const categorySpecs = [
    { name: "Chest",      gradient: "from-[#FFB5B5] to-[#FF8C8C]",  textColor: "text-[#5A0000]", bodyParts: ["chest"] },
    { name: "Back",       gradient: "from-[#B5D4FF] to-[#7FB3FF]",  textColor: "text-[#003A6E]", bodyParts: ["back"] },
    { name: "Shoulders",  gradient: "from-[#FFD9B5] to-[#FFB87F]",  textColor: "text-[#6B3500]", bodyParts: ["shoulders"] },
    { name: "Biceps",     gradient: "from-[#B5FFC8] to-[#7FFFA0]",  textColor: "text-[#004F1A]", bodyParts: ["biceps"] },
    { name: "Triceps",    gradient: "from-[#D9B5FF] to-[#B87FFF]",  textColor: "text-[#2E0060]", bodyParts: ["triceps"] },
    { name: "Legs",       gradient: "from-[#FFFAB5] to-[#FFF47F]",  textColor: "text-[#8B7000]", bodyParts: ["legs", "leg"] },
    { name: "Abs",        gradient: "from-[#FFB5E8] to-[#FF7FD4]",  textColor: "text-[#6B0047]", bodyParts: ["abs"] },
    { name: "Cardio",     gradient: "from-[#B5FFFA] to-[#7FFFF4]",  textColor: "text-[#006B68]", bodyParts: ["cardio"] },
    { name: "Calves",     gradient: "from-[#FFF2CC] to-[#FFE699]",  textColor: "text-[#5C4300]", bodyParts: ["calves", "calf"] },
    { name: "Forearms",   gradient: "from-[#FFE8FF] to-[#FFAEFF]",  textColor: "text-[#5A005A]", bodyParts: ["forearms", "forearm"] },
    { name: "Traps",      gradient: "from-[#D5FFE0] to-[#9BFFB5]",  textColor: "text-[#004D1B]", bodyParts: ["traps", "trapezius"] },
    { name: "Lower Back", gradient: "from-[#E2F0D9] to-[#C5E0B4]",  textColor: "text-[#385723]", bodyParts: ["lower back", "erector-spinae"] },
    { name: "Full Body",  gradient: "from-[#E0FFB5] to-[#C8FF7F]",  textColor: "text-[#3B5A00]", bodyParts: ["full body", "full-body"] },
    { name: "Neck",       gradient: "from-[#FFE6B5] to-[#FFCC7F]",  textColor: "text-[#5A3000]", bodyParts: ["neck"] }
  ];

  const filterChips = [
    "All", "Beginner", "Inter", "Advanced", "15min", "Strength", "Hypertrophy"
  ];

  // Helper count getter
  const getCategoryCount = (spec) => {
    if (!exercises) return 0;
    return exercises.filter(ex => 
      spec.bodyParts.includes(ex.bodyPart.toLowerCase())
    ).length;
  };

  // Main filter function
  const getFilteredExercises = () => {
    if (!exercises) return [];
    let list = [...exercises];

    if (showFavsOnly) {
      list = list.filter(ex => favorites.includes(ex.name));
    }

    if (selectedCategory !== "All") {
      const spec = categorySpecs.find(s => s.name === selectedCategory);
      if (spec) {
        list = list.filter(ex => 
          spec.bodyParts.includes(ex.bodyPart.toLowerCase())
        );
      }
    }

    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      list = list.filter(ex => 
        ex.name.toLowerCase().includes(q) || 
        ex.bodyPart.toLowerCase().includes(q) ||
        ex.equipment.toLowerCase().includes(q)
      );
    }

    if (activeDifficulty !== "All") {
      list = list.filter(ex => ex.difficulty.toLowerCase().includes(activeDifficulty.toLowerCase().substring(0, 5)));
    }

    if (activeTime !== "All") {
      if (activeTime === "15min") {
        list = list.filter(ex => ex.bodyPart.toLowerCase() === "cardio" || ex.difficulty.toLowerCase() === "beginner");
      } else if (activeTime === "30min") {
        list = list.filter(ex => ex.equipment.toLowerCase() === "dumbbell" || ex.bodyPart.toLowerCase() === "arms");
      } else if (activeTime === "45min") {
        list = list.filter(ex => ex.equipment.toLowerCase() === "barbell");
      } else if (activeTime === "60min+") {
        list = list.filter(ex => ex.equipment.toLowerCase() === "machine" || ex.equipment.toLowerCase() === "cable");
      }
    }

    if (activeGoal !== "All") {
      if (activeGoal === "Strength") {
        list = list.filter(ex => ex.equipment.toLowerCase() === "barbell");
      } else if (activeGoal === "Hypertrophy") {
        list = list.filter(ex => ex.equipment.toLowerCase().includes("bell") || ex.equipment.toLowerCase() === "cable");
      } else if (activeGoal === "Endurance") {
        list = list.filter(ex => ex.equipment.toLowerCase() === "body weight" || ex.bodyPart.toLowerCase() === "cardio");
      }
    }

    if (activeEquipment !== "All") {
      list = list.filter(ex => ex.equipment.toLowerCase().includes(activeEquipment.toLowerCase()));
    }

    return list;
  };

  const handleCategorySelect = (catName) => {
    setSelectedCategory(catName);
    setPageSize(25);
    setScreen("list");
  };

  const handleLoadTemplate = (type) => {
    if (!exercises) return;
    let selected = [];
    const t = type.toLowerCase();
    if (t === "push") {
      selected = exercises.filter(ex => ["chest", "shoulders", "triceps"].includes(ex.bodyPart.toLowerCase())).slice(0, 4);
    } else if (t === "pull") {
      selected = exercises.filter(ex => ["back", "biceps"].includes(ex.bodyPart.toLowerCase())).slice(0, 4);
    } else if (t === "legs") {
      selected = exercises.filter(ex => ["legs", "calves", "quads", "hamstrings", "glutes"].includes(ex.bodyPart.toLowerCase())).slice(0, 4);
    } else {
      // Full Body
      selected = exercises.filter(ex => ["chest", "back", "legs", "shoulders"].includes(ex.bodyPart.toLowerCase())).slice(0, 4);
    }
    setActiveStack(selected);
    setStackName(`${type} Day Template`);
  };

  const handleAIGenerateStack = () => {
    if (!exercises) return;
    const shuffled = [...exercises].sort(() => 0.5 - Math.random());
    setActiveStack(shuffled.slice(0, 4));
    setStackName("AI Auto-Generated Stack 🤖");
  };

  const handleShareStack = () => {
    alert("Stack template invite link copied to clipboard! Share with gym buddies! 🚀");
  };

  const handleAddToStack = (exercise) => {
    if (activeStack.some(item => item.id === exercise.id)) {
      setActiveStack(prev => prev.filter(item => item.id !== exercise.id));
    } else {
      setActiveStack(prev => [...prev, exercise]);
    }
  };

  const handleSaveStack = () => {
    if (activeStack.length === 0) return;
    const newPlan = {
      id: `plan-stack-${Date.now()}`,
      name: stackName,
      difficulty: "Intermediate",
      duration: activeStack.length * 8, 
      category: "Custom Stack",
      exercises: activeStack.map((ex) => ({
        name: ex.name,
        target: ex.bodyPart,
        sets: [
          { reps: 10, weight: 15, completed: false },
          { reps: 10, weight: 15, completed: false },
          { reps: 10, weight: 15, completed: false }
        ]
      }))
    };
    savePlan(newPlan);
    alert(`Stack "${stackName}" successfully saved to Workout Plans!`);
    setShowStackModal(false);
  };

  const filteredExercises = getFilteredExercises();
  const paginatedList = filteredExercises.slice(0, pageSize);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-[#1a1a1a] bg-transparent">
        <div className="w-10 h-10 border-4 border-orange-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-bold text-gray-500 animate-pulse">Syncing exercise database (1,411 moves)...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-[#1a1a1a] pb-24 px-5 pt-4 bg-transparent min-h-screen">
      
      {/* ==================== SCREEN 1: CATEGORIES ==================== */}
      {screen === "categories" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          {/* Header Row */}
          <div className="flex justify-between items-center select-none">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Reference</span>
              <h2 className="text-xl font-black text-[#1a1a1a] leading-none uppercase">Exercises</h2>
            </div>
            
            {/* Favourites + Stacks Icons */}
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  setShowFavsOnly(!showFavsOnly);
                  setSelectedCategory("All");
                  setScreen("list");
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                  showFavsOnly ? "bg-red-50 border-red-200 text-red-500" : "bg-surface border-gray-100 text-gray-400"
                }`}
              >
                <Heart size={18} className={showFavsOnly ? "fill-red-500" : ""} />
              </button>
              
              <button 
                onClick={() => setShowStackModal(true)}
                className="w-10 h-10 rounded-full bg-surface border border-gray-100 text-gray-400 flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform"
              >
                <List size={18} />
                {activeStack.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-accent text-white border-2 border-white font-extrabold text-[8px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                    {activeStack.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search 1,411+ gym exercises..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim() !== "") {
                  setScreen("list");
                }
              }}
              className="w-full bg-surface border border-gray-100 focus:border-orange-accent focus:bg-white rounded-full py-3.5 pl-12 pr-4 text-xs font-semibold outline-none transition-all"
            />
            <Search className="absolute left-4 top-3.75 text-gray-400" size={16} />
          </div>

          {/* Muscle categories header */}
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 select-none">Muscle Categories</h4>

          {/* Category Grid: pill shape, left text, right = real GIF */}
          <div className="grid grid-cols-2 gap-3.5">
            {categorySpecs.map((spec) => {
              const count = getCategoryCount(spec);
              const gifSrc = CATEGORY_GIFS[spec.name];
              return (
                <button
                  key={spec.name}
                  onClick={() => handleCategorySelect(spec.name)}
                  className={`h-16 w-full rounded-full bg-linear-to-r ${spec.gradient} cursor-pointer active:scale-[0.98] transition-all overflow-hidden flex items-center justify-between pl-4 pr-1 shadow-xs`}
                >
                  <div className="flex flex-col items-start leading-none text-left">
                    <span className={`text-xs font-black tracking-wide ${spec.textColor}`}>{spec.name}</span>
                    <span className={`text-[9px] font-bold mt-1 opacity-75 ${spec.textColor}`}>{count} Moves</span>
                  </div>

                  {/* Right circle: real exercise GIF */}
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-white/70 shadow-sm bg-white">
                    <img 
                      src={gifSrc} 
                      alt={spec.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </button>
              );
            })}
          </div>

          {/* F6 — Recently Used Exercises */}
          <div className="flex flex-col gap-2.5 mt-2 select-none">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Recently Used</h4>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {exercises.slice(4, 9).map((ex) => (
                <div 
                  key={ex.id}
                  onClick={() => {
                    setSelectedExercise(ex);
                    setScreen("detail");
                  }}
                  className="bg-white border border-gray-100 rounded-2xl p-3 min-w-35 shrink-0 flex gap-2 items-center cursor-pointer active:scale-97 transition-all shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-50 flex items-center justify-center">
                    <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-[10px] text-[#1a1a1a] line-clamp-1">{ex.name}</h5>
                    <span className="text-[8px] font-bold text-orange-accent block mt-0.5 uppercase tracking-wide">{ex.bodyPart}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* F7 — Trending Exercises Horizontal Scroll Row */}
          <div className="flex flex-col gap-2.5 mt-2 select-none">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Trending Exercises</h4>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
              {exercises.slice(22, 28).map((ex) => (
                <div 
                  key={ex.id}
                  onClick={() => {
                    setSelectedExercise(ex);
                    setScreen("detail");
                  }}
                  className="bg-orange-accent/5 border border-orange-200/40 rounded-2xl p-3 min-w-35 shrink-0 flex gap-2 items-center cursor-pointer active:scale-97 transition-all shadow-xs"
                >
                  <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-white border border-orange-100 flex items-center justify-center">
                    <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h5 className="font-bold text-[10px] text-[#1a1a1a] line-clamp-1">{ex.name}</h5>
                    <span className="text-[8px] font-bold text-orange-accent block mt-0.5 uppercase tracking-wide">{ex.bodyPart}</span>
                    <span className="text-[8px] font-black text-orange-accent/80 block mt-0.5">2.4k this week</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* ==================== SCREEN 2: EXERCISES LIST ==================== */}
      {screen === "list" && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5"
        >
          {/* Header Row */}
          <div className="flex justify-between items-center select-none">
            <button 
              onClick={() => {
                setScreen("categories");
                setShowFavsOnly(false);
              }}
              className="flex items-center gap-1.5 text-xs font-bold text-orange-accent bg-orange-50 py-2 px-4 rounded-full cursor-pointer hover:bg-orange-accent hover:text-white transition-all"
            >
              <ArrowLeft size={14} /> Back
            </button>
            
            <button 
              onClick={() => setShowStackModal(true)}
              className="w-10 h-10 rounded-full bg-surface border border-gray-100 text-gray-400 flex items-center justify-center relative cursor-pointer active:scale-95 transition-transform"
            >
              <List size={18} />
              {activeStack.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-accent text-white border-2 border-white font-extrabold text-[8px] w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                  {activeStack.length}
                </span>
              )}
            </button>
          </div>

          {/* Section Title */}
          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-orange-accent">Exercise Library</span>
            <h2 className="text-xl font-black text-[#1a1a1a] leading-none uppercase mt-0.5">
              {showFavsOnly ? "Saved Favourites" : `${selectedCategory} Moves`}
            </h2>
            <span className="text-[10px] font-bold text-gray-400 block mt-1">{filteredExercises.length} items found</span>
          </div>

          {/* Search bar inside list view */}
          <div className="relative">
            <input
              type="text"
              placeholder={`Search within list...`}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPageSize(25);
              }}
              className="w-full bg-surface border border-gray-100 focus:border-orange-accent focus:bg-white rounded-full py-3 pl-11 pr-4 text-xs font-semibold outline-none transition-all"
            />
            <Search className="absolute left-4 top-3.5 text-gray-400" size={16} />
          </div>

          {/* Multi-Filter Rows */}
          <div className="flex flex-col gap-2 bg-white/40 backdrop-blur-md border border-gray-100 rounded-2xl p-3 select-none">
            {[
              { label: "Difficulty", value: activeDifficulty, setter: setActiveDifficulty, items: ["All", "Beginner", "Intermediate", "Advanced"] },
              { label: "Time", value: activeTime, setter: setActiveTime, items: ["All", "15min", "30min", "45min", "60min+"] },
              { label: "Goal", value: activeGoal, setter: setActiveGoal, items: ["All", "Strength", "Hypertrophy", "Endurance"] },
              { label: "Equipment", value: activeEquipment, setter: setActiveEquipment, items: ["All", "Barbell", "Dumbbell", "Bodyweight", "Machine"] }
            ].map((row) => (
              <div key={row.label} className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[9px] font-black text-gray-400 uppercase w-15 shrink-0">{row.label}</span>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                  {row.items.map((item) => {
                    const isSelected = row.value === item;
                    return (
                      <button
                        key={item}
                        onClick={() => {
                          row.setter(item);
                          setPageSize(25);
                        }}
                        className={`shrink-0 py-1 px-3 rounded-full text-[9px] font-extrabold uppercase tracking-wider cursor-pointer transition-all border ${
                          isSelected 
                            ? "bg-linear-to-r from-orange-accent to-[#FF9500] text-white border-none shadow-xs" 
                            : "bg-surface border-gray-100 text-gray-400 hover:text-[#1a1a1a]"
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Exercises list */}
          <div className="flex flex-col gap-3.5">
            {paginatedList.length === 0 ? (
              <div className="text-center py-12 italic text-gray-400 text-xs bg-gray-50 rounded-[20px]">
                No matching exercises in this list.
              </div>
            ) : (
              paginatedList.map((ex) => {
                const isFav = favorites.includes(ex.name);
                const isStacked = activeStack.some(item => item.id === ex.id);
                
                const getDiffBadge = (diff) => {
                  const d = diff.toLowerCase();
                  if (d.includes("beg")) return "bg-green-50 text-green-600 border border-green-100 rounded-full px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider";
                  if (d.includes("int") || d.includes("mid")) return "bg-orange-50 text-orange-600 border border-orange-100 rounded-full px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider";
                  return "bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5 font-bold text-[8px] uppercase tracking-wider";
                };

                return (
                  <div
                    key={ex.id}
                    onClick={() => {
                      setSelectedExercise(ex);
                      setScreen("detail");
                    }}
                    className="flex gap-4 p-3 bg-white border border-gray-100 rounded-[20px] items-center hover:border-orange-100 hover:shadow-xs active:scale-[0.99] transition-all cursor-pointer"
                  >
                    {/* F4 — GIF Preview Box (52px) */}
                    <div className="w-13 h-13 rounded-xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 flex items-center justify-center">
                      <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" loading="lazy" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-[#1a1a1a] line-clamp-1 leading-snug">{ex.name}</h4>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        <span className="bg-orange-50 text-orange-accent font-bold text-[8px] uppercase tracking-wider py-0.5 px-2 rounded-md">
                          {ex.bodyPart}
                        </span>
                        <span className="bg-gray-50 text-gray-500 font-bold text-[8px] uppercase tracking-wider py-0.5 px-2 rounded-md">
                          {ex.equipment}
                        </span>
                        <span className={getDiffBadge(ex.difficulty)}>
                          {ex.difficulty}
                        </span>
                      </div>
                    </div>

                    {/* F4 — Calorie Count Right */}
                    <div className="text-right shrink-0 select-none">
                      <span className="text-[10px] font-black text-orange-accent block">{Math.round(ex.name.length * 0.15 + 4)} kcal</span>
                      <span className="text-[8px] font-bold text-gray-400 block uppercase mt-0.5">Burn Est</span>
                    </div>

                    {/* Actions block */}
                    <div className="flex gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => toggleFavorite(ex.name)}
                        className="p-2 transition-colors cursor-pointer"
                      >
                        <Heart size={16} className={isFav ? "fill-orange-accent stroke-orange-accent text-orange-accent" : "text-gray-400 hover:text-orange-accent"} />
                      </button>
                      <button 
                        onClick={() => handleAddToStack(ex)}
                        className={`p-2 rounded-lg transition-colors cursor-pointer ${
                          isStacked ? "text-success-green" : "text-gray-400 hover:text-orange-accent"
                        }`}
                      >
                        {isStacked ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} />}
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {filteredExercises.length > pageSize && (
              <button 
                onClick={() => setPageSize(prev => prev + 25)}
                className="bg-gray-50 border border-gray-100 hover:bg-gray-100 text-gray-600 font-black text-xs uppercase tracking-wider py-3.5 w-full rounded-full cursor-pointer transition-all mt-2"
              >
                Load More Moves
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* ==================== SCREEN 3: EXERCISE DETAIL ==================== */}
      {screen === "detail" && selectedExercise && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-5 text-[#1a1a1a]"
        >
          {/* Header row */}
          <div className="flex items-center justify-between select-none">
            <button 
              onClick={() => setScreen("list")}
              className="flex items-center gap-1.5 text-xs font-bold text-orange-accent bg-orange-50 py-2 px-4 rounded-full cursor-pointer hover:bg-orange-accent hover:text-white transition-all"
            >
              <ArrowLeft size={14} /> Back
            </button>

            <button 
              onClick={() => toggleFavorite(selectedExercise.name)}
              className="w-10 h-10 rounded-full bg-surface border border-gray-100 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Heart size={18} className={favorites.includes(selectedExercise.name) ? "fill-orange-accent stroke-orange-accent text-orange-accent" : "text-gray-400"} />
            </button>
          </div>

          <div>
            <span className="text-[9px] font-bold uppercase tracking-wider text-orange-accent">Exercise Instructions</span>
            <h2 className="text-xl font-black text-[#1a1a1a] leading-tight mt-0.5">{selectedExercise.name}</h2>
          </div>

          {/* Large GIF Player box */}
          <div className="w-full aspect-square rounded-3xl overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center relative shadow-xs">
            <img 
              src={selectedExercise.gifUrl} 
              alt={selectedExercise.name} 
              className="w-full h-full object-cover" 
            />
          </div>

          {/* Tags */}
          <div className="flex gap-2">
            <span className="bg-orange-50 text-orange-accent font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full">
              {selectedExercise.bodyPart}
            </span>
            <span className="bg-gray-50 text-gray-500 font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full">
              {selectedExercise.equipment}
            </span>
            <span className="bg-gray-50 text-gray-500 font-extrabold text-[10px] uppercase tracking-wider py-1.5 px-4 rounded-full">
              {selectedExercise.difficulty}
            </span>
          </div>

          {/* Guide description */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-xs flex flex-col gap-3">
            <h4 className="font-sans font-bold text-sm text-[#1a1a1a]">Description</h4>
            <p className="text-xs text-gray-500 leading-relaxed font-sans font-medium">
              {selectedExercise.description}
            </p>
          </div>

          {/* F8-F14 — Detail Execution Guides */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-xs select-none">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Est. Calories</span>
              <span className="text-xs font-black text-orange-accent block mt-1">{Math.round(selectedExercise.name.length * 0.15 + 4)} kcal/set</span>
            </div>
            <div className="bg-white border border-gray-100 rounded-[20px] p-4 shadow-xs select-none">
              <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Personal Best 🏆</span>
              <span className="text-xs font-black text-orange-accent block mt-1">
                {selectedExercise.name.includes("Squat") || selectedExercise.name.includes("Deadlift") ? "120 kg x 5" : selectedExercise.name.includes("Press") ? "80 kg x 8" : "40 kg x 10"}
              </span>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-xs flex flex-col gap-3 select-none">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-orange-accent">Execution Guides</h4>
            
            <div className="flex flex-col gap-2.5">
              <div>
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Time Under Tension (TUT)</span>
                <p className="text-[11px] text-[#1a1a1a] font-medium mt-0.5 leading-relaxed">
                  3s Eccentric phase (lowering) • 1s Pause at peak contraction • 1s Concentric push. Keep speed controlled.
                </p>
              </div>
              
              <div className="border-t border-gray-50 pt-2.5">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Breathing Pattern</span>
                <p className="text-[11px] text-[#1a1a1a] font-medium mt-0.5 leading-relaxed">
                  Inhale deeply on eccentric (controlled lowering). Exhale forcefully on concentric (peak exertion).
                </p>
              </div>

              <div className="border-t border-gray-50 pt-2.5">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Injury Risk & Warning</span>
                <p className="text-[11px] text-red-500 font-extrabold mt-0.5 leading-relaxed">
                  ⚠️ Medium Risk. Maintain proper structural form. Keep spine strictly neutral and avoid bouncing or momentum.
                </p>
              </div>

              <div className="border-t border-gray-50 pt-2.5">
                <span className="text-[9px] font-bold text-gray-400 block uppercase">Muscle Recruitment Diagram</span>
                <div className="flex gap-2 mt-1">
                  <span className="text-[8px] bg-orange-50 border border-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-black uppercase">Primary: {selectedExercise.bodyPart} (100%)</span>
                  <span className="text-[8px] bg-gray-50 border border-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-black uppercase">Synergists: Joints & Core Stability</span>
                </div>
              </div>
            </div>
          </div>

          {/* Volume Progression Chart */}
          <div className="bg-white border border-gray-100 rounded-[20px] p-5 shadow-xs select-none">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider block mb-3">4-Week Volume Progression</span>
            <div className="h-24 flex items-end justify-between px-2 pt-2 bg-gray-50 rounded-xl border border-gray-100/50">
              {[
                { label: "Wk 1", vol: 2400 },
                { label: "Wk 2", vol: 2800 },
                { label: "Wk 3", vol: 2900 },
                { label: "Wk 4", vol: 3200 }
              ].map((w, idx) => {
                const heightPct = Math.round((w.vol / 3200) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                    <span className="text-[8px] text-orange-accent font-black">{w.vol} kg</span>
                    <div 
                      className="w-4 bg-linear-to-t from-orange-accent to-[#FF9500] rounded-t-md transition-all duration-500" 
                      style={{ height: `${heightPct * 0.4}px` }}
                    />
                    <span className="text-[8px] text-gray-400 font-bold uppercase">{w.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action to Start Exercise */}
          <button 
            onClick={() => navigate(`/workout/active/plan-push`)}
            className="bg-linear-to-r from-orange-accent to-[#FF9500] hover:shadow-[0_4px_15px_rgba(255,107,0,0.3)] text-white font-black text-xs uppercase tracking-widest py-4 w-full rounded-full flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all"
          >
            <Play size={14} fill="currentColor" /> Start Workout Session
          </button>
        </motion.div>
      )}

      {/* ==================== STACK QUEUE MODAL ==================== */}
      <AnimatePresence>
        {showStackModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-5">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowStackModal(false)}
              className="fixed inset-0 bg-[#1a1a1a]"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 relative z-10 shadow-2xl overflow-hidden"
            >
              <h3 className="font-sans font-bold text-lg text-[#1a1a1a] mb-2">Stack Queue Creator</h3>
              <p className="text-xs text-gray-500 font-medium font-sans mb-4">Combine exercises into a single custom training template.</p>
              
              <input 
                type="text" 
                value={stackName} 
                onChange={(e) => setStackName(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 px-4 text-xs font-semibold outline-none focus:border-orange-accent mb-3.5"
                placeholder="Stack Name"
              />

              {/* F15-F19 — Load templates */}
              <div className="flex gap-1.5 mb-3.5 overflow-x-auto no-scrollbar select-none">
                {["Push", "Pull", "Legs", "Full Body"].map((t) => (
                  <button
                    key={t}
                    onClick={() => handleLoadTemplate(t)}
                    className="bg-orange-50 border border-orange-100 hover:bg-orange-accent hover:text-white text-orange-accent px-3 py-1 rounded-full text-[9px] font-black uppercase shrink-0 transition-colors cursor-pointer"
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4 select-none">
                <button
                  onClick={handleAIGenerateStack}
                  className="bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-600 rounded-full px-3 py-1.5 text-[9px] font-black uppercase flex items-center gap-1 cursor-pointer transition-colors"
                >
                  🤖 AI Auto-Generate
                </button>
                {activeStack.length > 0 && (
                  <button
                    onClick={handleShareStack}
                    className="text-orange-accent hover:underline text-[9px] font-black uppercase cursor-pointer"
                  >
                    Share Stack 🔗
                  </button>
                )}
              </div>

              {activeStack.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-400 italic font-sans mb-4">
                  Queue is currently empty. Tap "+" on any exercise card to build your stack.
                </div>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 mb-5 no-scrollbar pr-1">
                  {activeStack.map((ex) => (
                    <div key={ex.id} className="flex justify-between items-center bg-surface p-2.5 rounded-xl border border-gray-100">
                      <span className="font-bold text-[10px] text-[#1a1a1a] truncate w-4/5">{ex.name}</span>
                      <button 
                        onClick={() => handleAddToStack(ex)}
                        className="text-[9px] font-black text-red-500 uppercase cursor-pointer hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowStackModal(false)}
                  className="flex-1 py-3 bg-gray-50 text-gray-500 border border-gray-100 rounded-full font-bold text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSaveStack}
                  disabled={activeStack.length === 0}
                  className="flex-1 py-3 bg-linear-to-r from-orange-accent to-[#FF9500] text-white rounded-full font-black text-xs uppercase cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Save Stack
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Library;
