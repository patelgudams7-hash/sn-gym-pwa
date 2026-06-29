import React from "react";
import { useNavigate } from "react-router-dom";
import { useGym } from "../store/GymContext";
import { 
  Dumbbell, 
  Trophy, 
  Plus, 
  Play
} from "lucide-react";
import { motion } from "framer-motion";

// Premium Section Header component
const SectionHeader = ({ emoji, title, subtitle, rightElement }) => (
  <div className="flex items-center justify-between border-b border-gray-100/80 pb-2.5 mb-2.5 select-none">
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-orange-accent/10 flex items-center justify-center text-sm shadow-2xs">
        {emoji}
      </div>
      <div className="flex flex-col">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#1a1a1a]">
          {title}
        </h3>
        {subtitle && (
          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
            {subtitle}
          </span>
        )}
      </div>
    </div>
    {rightElement ? rightElement : (
      <div className="flex gap-0.5">
        <div className="w-1.5 h-1.5 rounded-full bg-orange-accent animate-pulse" />
        <div className="w-4 h-1.5 rounded-full bg-linear-to-r from-orange-accent to-[#FF9500]" />
      </div>
    )}
  </div>
);

// Custom Guru / Meditation SVG Icon for Coach SN Suggestions
const GuruIconMini = ({ size = 20, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="11" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
    <circle cx="12" cy="6.5" r="2.5" fill="currentColor" />
    <path d="M12 9.5 C10 9.5, 9 11.5, 9 13.5 C9 15, 10.5 16, 12 16 C13.5 16, 15 15, 15 13.5 C15 11.5, 14 9.5, 12 9.5 Z" fill="currentColor" />
    <path d="M6 18.5 C7.5 17, 9 16.5, 10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 18.5 C16.5 17, 15 16.5, 14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 19 C4 17.5, 8 16.5, 12 16.5 C16 16.5, 20 17.5, 20 19 C20 20.5, 17 21, 12 21 C7 21, 4 20.5, 4 19 Z" fill="currentColor" />
  </svg>
);

export const Dashboard = () => {
  const { profile, history, plans } = useGym();
  const navigate = useNavigate();

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  // Streak calculations
  const currentStreak = profile?.currentStreak || 5;
  const longestStreak = profile?.longestStreak || 12;

  // XP Progress levels
  const xp = profile?.xp || 1850;
  const level = profile?.level || 4;
  const rank = profile?.rankTitle || "Beast Mode";
  const xpInCurrentLevel = xp % 500;
  const xpProgressPct = Math.min(100, Math.round((xpInCurrentLevel / 500) * 100));

  // Weekly workouts count
  const getWeeklyCount = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
    monday.setHours(0, 0, 0, 0);

    const weekWorkouts = history.filter((h) => {
      const logDate = new Date(h.date);
      return logDate >= monday;
    });
    return weekWorkouts.length;
  };

  const weeklyCount = getWeeklyCount();
  const weeklyGoal = profile?.weeklyGoal || 4;
  const weeklyPercentage = Math.min(100, Math.round((weeklyCount / weeklyGoal) * 100));

  // suggested today's workout
  const suggestedPlan = plans[history.length % plans.length] || plans[0] || null;

  // Muscle Fatigue recovery levels
  const fatigueLevels = [
    { muscle: "Chest", recovery: 85, label: "Done", color: "bg-[#FF6B00]" },
    { muscle: "Back", recovery: 70, label: "Done", color: "bg-[#FF9500]" },
    { muscle: "Legs", recovery: 35, label: "Resting", color: "bg-[#FFD4B5]" },
    { muscle: "Arms", recovery: 90, label: "Done", color: "bg-[#FF6B00]" }
  ];

  // Stat Cards values
  const totalWorkouts = history.length;
  const totalVolume = history.reduce((sum, h) => {
    let vol = 0;
    h.exercises?.forEach(ex => {
      ex.sets?.forEach(s => {
        vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      });
    });
    return sum + vol;
  }, 8240);

  const totalHours = Math.round((history.reduce((sum, h) => sum + (h.durationSeconds || 0), 11520) / 3600) * 10) / 10;
  const totalCalories = history.reduce((sum, h) => sum + (h.caloriesBurned || 0), 1280);

  // SVG ring setup
  const ringRadius = 22;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringStrokeOffset = ringCircumference - (weeklyPercentage / 100) * ringCircumference;

  // Staggered transition configs
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6 text-[#1a1a1a] pb-24 px-5 pt-4 font-sans bg-transparent"
    >
      {/* 1. Greeting & Profile Header */}
      <motion.div variants={itemVariants} className="flex justify-between items-center select-none">
        <div>
          <span className="text-[9px] text-orange-accent font-black uppercase tracking-widest">
            {new Date().toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' })}
          </span>
          <h2 className="text-xl font-extrabold text-[#1a1a1a] tracking-tight mt-0.5">{getGreeting()}, {profile?.name || "Warrior"}</h2>
        </div>
      </motion.div>


      {/* 2. Suggested Workout Hero Banner */}
      {suggestedPlan && (
        <motion.div 
          variants={itemVariants} 
          className="relative rounded-3xl bg-linear-to-r from-orange-accent to-[#FF9500] p-6 text-white shadow-[0_8px_24px_rgba(255,107,0,0.25)] overflow-hidden"
        >
          <div className="absolute -right-5 -top-5 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute right-8 -bottom-8 w-24 h-24 rounded-full bg-white/5" />
          
          <span className="text-[10px] font-bold text-white/85 tracking-widest block uppercase">Today's Session</span>
          <h3 className="text-2xl font-black text-white mt-1 leading-tight">{suggestedPlan.name}</h3>
          
          <button 
            onClick={() => navigate(`/workout/active/${suggestedPlan.id}`)}
            className="mt-4 inline-flex items-center gap-2 bg-white text-orange-accent py-2.5 px-6 rounded-full font-black text-xs shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Play fill="currentColor" size={10} /> Start Now
          </button>

          <div className="flex gap-6 mt-6 pt-4 border-t border-white/10 text-white/90">
            <div>
              <div className="text-[15px] font-black leading-none">{suggestedPlan.exercises?.length || 8}</div>
              <div className="text-[9px] font-bold uppercase opacity-75 mt-1">Exercises</div>
            </div>
            <div>
              <div className="text-[15px] font-black leading-none">{suggestedPlan.duration || 45}m</div>
              <div className="text-[9px] font-bold uppercase opacity-75 mt-1">Duration</div>
            </div>
            <div>
              <div className="text-[15px] font-black leading-none">{Math.round(suggestedPlan.duration * 7.5)}</div>
              <div className="text-[9px] font-bold uppercase opacity-75 mt-1">Burn Est</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. Streaks Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <SectionHeader emoji="🔥" title="Workout Streak" subtitle="Keep the momentum" />
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-linear-to-r from-orange-accent to-[#FF9500] rounded-2xl p-4 text-center text-white shadow-[0_4px_12px_rgba(255,107,0,0.2)]">
            <span className="text-xl block">🔥</span>
            <div className="text-xl font-black mt-1 leading-none">{currentStreak}</div>
            <div className="text-[9px] text-white/90 font-bold uppercase tracking-wider mt-1.5">Current</div>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
            <span className="text-xl block">🏆</span>
            <div className="text-xl font-black text-[#1a1a1a] mt-1 leading-none">{longestStreak}</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Longest</div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
            <span className="text-xl block">📅</span>
            <div className="text-xl font-black text-[#1a1a1a] mt-1 leading-none">{history.length + 12}</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Month</div>
          </div>
        </div>
      </motion.div>

      {/* 4. XP Level Indicator card */}
      <motion.div variants={itemVariants} className="bg-[#1a1a1a] rounded-[20px] p-5 text-white shadow-lg">
        <div className="flex justify-between items-center mb-3">
          <div>
            <div className="text-[10px] font-bold text-orange-accent tracking-widest uppercase">Level {level}</div>
            <h4 className="text-sm font-extrabold mt-0.5">{rank}</h4>
          </div>
          <span className="bg-linear-to-r from-orange-accent to-[#FF9500] text-white font-black text-[10px] px-3.5 py-1.5 rounded-full uppercase">
            {xp} XP
          </span>
        </div>
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mb-2.5">
          <div 
            className="bg-linear-to-r from-orange-accent to-[#FF9500] h-full"
            style={{ width: `${xpProgressPct}%` }}
          />
        </div>
        <span className="text-[9px] text-white/50 font-bold uppercase">
          {500 - xpInCurrentLevel} XP to Level {level + 1}
        </span>
      </motion.div>

      {/* 5. Weekly Goals & Muscle Recovery Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <SectionHeader emoji="📊" title="This Week" subtitle="Goal & muscle recovery" />
        <div className="grid grid-cols-2 gap-3">
          {/* Weekly Goal Progress circle */}
          <div className="bg-gray-50 border border-gray-100/50 rounded-2xl p-4 flex flex-col gap-2.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Weekly Goal</h4>
            
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="24" cy="24" r={ringRadius} stroke="#E5E7EB" strokeWidth="4.5" fill="transparent" />
                  <circle 
                    cx="24" 
                    cy="24" 
                    r={ringRadius} 
                    stroke="#FF6B00" 
                    strokeWidth="4.5" 
                    fill="transparent" 
                    strokeDasharray={ringCircumference}
                    strokeDashoffset={ringStrokeOffset}
                    strokeLinecap="round"
                    className="transition-all duration-700 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-black text-[#1a1a1a]">{weeklyPercentage}%</span>
              </div>
              
              <div className="min-w-0">
                <div className="text-[9px] text-gray-400 font-bold">{weeklyCount}/{weeklyGoal} Hit</div>
                <div className="text-[9px] text-orange-accent font-black mt-0.5">
                  {weeklyGoal - weeklyCount > 0 ? `${weeklyGoal - weeklyCount} Left` : "Finished! 🔥"}
                </div>
              </div>
            </div>
          </div>

          {/* Muscle Recovery fatigue status */}
          <div className="bg-gray-50 border border-gray-100/50 rounded-2xl p-4 flex flex-col gap-2.5">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fatigue levels</h4>
            
            <div className="flex flex-col gap-1.5">
              {fatigueLevels.map(f => (
                <div key={f.muscle} className="flex items-center gap-1.5 text-[9px] font-bold text-gray-400">
                  <span className="w-7 shrink-0">{f.muscle}</span>
                  <div className="flex-1 bg-gray-200/60 h-1 rounded-full overflow-hidden">
                    <div className={`h-full ${f.color}`} style={{ width: `${f.recovery}%` }} />
                  </div>
                  <span className="text-[8px] font-bold text-orange-accent">{f.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* 6. Weekly Metrics Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4 shrink-0 select-none">
        <SectionHeader emoji="📈" title="Weekly Metrics" subtitle="Performance tracker" />
        
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-30 shrink-0">
            <div className="text-xl font-black text-[#1a1a1a] leading-none">{totalWorkouts}</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Workouts</div>
            <div className="text-[9px] text-success-green font-bold mt-1">+1 vs last wk</div>
          </div>
          
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-30 shrink-0">
            <div className="text-xl font-black text-[#1a1a1a] leading-none">{totalVolume.toLocaleString()} kg</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Volume Lifted</div>
            <div className="text-[9px] text-success-green font-bold mt-1">+12% vs last wk</div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-30 shrink-0">
            <div className="text-xl font-black text-[#1a1a1a] leading-none">{totalHours}h</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Hours Trained</div>
            <div className="text-[9px] text-success-green font-bold mt-1">+0.5h vs last wk</div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 min-w-30 shrink-0">
            <div className="text-xl font-black text-[#1a1a1a] leading-none">{totalCalories} kcal</div>
            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1.5">Burned</div>
            <div className="text-[9px] text-success-green font-bold mt-1">+8% vs last wk</div>
          </div>
        </div>
      </motion.div>

      {/* 7. Body Split Visual Map Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <SectionHeader emoji="💪" title="Body Split" subtitle="Active muscle groups" />

        <div className="grid grid-cols-4 gap-2.5">
          {[
            { name: "Chest", status: "done" },
            { name: "Back", status: "done" },
            { name: "Shoulders", status: "done" },
            { name: "Legs", status: "rest" },
            { name: "Biceps", status: "done" },
            { name: "Triceps", status: "done" },
            { name: "Core", status: "rest" },
            { name: "Cardio", status: "rest" }
          ].map(p => (
            <div 
              key={p.name}
              className={`rounded-xl py-2 px-1.5 text-center text-[10px] font-extrabold border ${
                p.status === "done" 
                  ? "bg-linear-to-r from-orange-accent to-[#FF9500] text-white border-none shadow-xs" 
                  : "bg-[#FFF0E5] text-orange-accent border-none"
              }`}
            >
              <span>{p.name}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 8. Monthly Heatmap Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <SectionHeader 
          emoji="🗓" 
          title="June Heatmap" 
          subtitle="Active days this month" 
          rightElement={<span className="text-[10px] font-bold text-orange-accent">18 / 30 active days</span>}
        />
        <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-gray-400 font-bold mb-2">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {Array.from({ length: 28 }).map((_, idx) => {
            const levels = ["bg-gray-50", "bg-[#FFEBDC]", "bg-[#FFCFA8]", "bg-[#FFAE6B]", "bg-[#FF6B00]"];
            const levelIdx = idx % 5 === 0 ? 4 : idx % 3 === 0 ? 2 : idx % 4 === 0 ? 1 : 0;
            return (
              <div 
                key={idx} 
                className={`h-7 rounded-lg flex items-center justify-center font-black text-[9px] ${levels[levelIdx]} ${levelIdx > 0 ? "text-white" : "text-gray-400"}`}
              >
                {idx + 1}
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* 9. AI Coach Suggestion Card */}
      <motion.div variants={itemVariants} className="bg-[#F0F7FF] border border-[#D2E7FF] rounded-[20px] p-4 flex items-center gap-3.5">
        <div className="w-10 h-10 bg-linear-to-r from-[#0088FF] to-[#3B9BFF] rounded-xl flex items-center justify-center shrink-0 text-white shadow-xs">
          <GuruIconMini size={22} />
        </div>
        <div>
          <span className="text-[9px] font-bold text-[#0088FF] uppercase tracking-widest block">Coach SN Suggests</span>
          <p className="text-[11px] text-[#1a1a1a] font-bold mt-0.5 leading-normal">
            Your chest and back are fully recovered. Try Push Day templates today for target growth!
          </p>
        </div>
      </motion.div>

      {/* 10. Badges Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <SectionHeader emoji="🏅" title="Gym Badges" subtitle="Achievements unlocked" />
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 select-none">
          {[
            { name: "Early Bird", icon: "🌅", earned: true },
            { name: "Iron Master", icon: "🏋️", earned: true },
            { name: "Consistency", icon: "📅", earned: true },
            { name: "PR Breaker", icon: "👑", earned: false },
            { name: "Plate Crusher", icon: "💥", earned: false }
          ].map((b, idx) => (
            <div 
              key={idx}
              className={`shrink-0 rounded-2xl p-3 text-center border min-w-24 ${
                b.earned 
                  ? "bg-linear-to-br from-[#FFF5F0] to-[#FFE0C8] border-[#FFB87F] text-orange-accent shadow-[0_4px_12px_rgba(255,107,0,0.08)]" 
                  : "bg-gray-50 border-gray-100 text-gray-300 opacity-60"
              }`}
            >
              <div className="text-2xl mb-1">{b.icon}</div>
              <div className="text-[8px] font-bold uppercase tracking-wider">{b.name}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 11. Recent Activity Card */}
      <motion.div variants={itemVariants} className="bg-white border border-gray-100 rounded-[28px] p-5 shadow-[0_8px_30px_rgba(0,0,0,0.05)] flex flex-col gap-4">
        <SectionHeader emoji="⏱" title="Recent Workouts" subtitle="Activity history" />
        <div className="flex flex-col gap-3">
          {[
            { name: "Push Day Workout", date: "Yesterday • 45 min", cal: "450 cal" },
            { name: "Legs & Core Workout", date: "3 days ago • 35 min", cal: "320 cal" },
            { name: "Pull Day Workout", date: "5 days ago • 50 min", cal: "480 cal" }
          ].map((act, idx) => (
            <div key={idx} className="flex justify-between items-center py-2.5 border-b border-gray-50 last:border-none">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0E5] flex items-center justify-center text-orange-accent shrink-0 border border-orange-50">
                  <Dumbbell size={18} />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-[#1a1a1a]">{act.name}</h4>
                  <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">{act.date}</span>
                </div>
              </div>
              <span className="text-xs font-extrabold text-orange-accent bg-orange-50 px-2.5 py-1 rounded-full">{act.cal}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* 12. Quick Log shortcut button */}
      <motion.button 
        variants={itemVariants}
        onClick={() => navigate("/plans")}
        className="bg-linear-to-r from-orange-accent to-[#FF9500] hover:shadow-[0_6px_20px_rgba(255,107,0,0.3)] rounded-full py-4 w-full text-white font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 cursor-pointer shadow-md active:scale-98 transition-all shrink-0"
      >
        <Plus size={16} strokeWidth={3} /> Quick Log Workout
      </motion.button>
    </motion.div>
  );
};

export default Dashboard;
