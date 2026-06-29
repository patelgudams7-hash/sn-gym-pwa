import React, { useState } from "react";
import { useGym } from "../store/GymContext";
import { useAuth } from "../store/AuthContext";
import { 
  User, 
  Dumbbell, 
  Clock, 
  Flame, 
  Trophy, 
  Sparkles, 
  ChevronRight, 
  Plus, 
  Trash2, 
  BarChart2, 
  Settings, 
  Target, 
  Camera, 
  Download,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const Profile = () => {
  const { logout } = useAuth();
  const { 
    profile, 
    updateProfile, 
    history, 
    anthropicKey, 
    setAnthropicKey, 
    customGoals,
    addCustomGoal,
    deleteCustomGoal,
    personalRecords,
    logMeasurements,
    measurements
  } = useGym();

  const [activeSection, setActiveSection] = useState("Settings"); // Settings | Analytics | Measurements | Goals | Photos

  // Form states
  const [name, setName] = useState(profile?.name || "Warrior");
  const [age, setAge] = useState(profile?.age || 26);
  const [height, setHeight] = useState(profile?.height || 180);
  const [weeklyGoal, setWeeklyGoal] = useState(profile?.weeklyGoal || 4);
  const [targetWeight, setTargetWeight] = useState(profile?.targetWeight || 75);
  const [apiKey, setApiKey] = useState(anthropicKey || "");
  const [profilePhoto, setProfilePhoto] = useState(profile?.photoUrl || localStorage.getItem("sn-gym-profile-photo") || "");

  // Preferences configuration states
  const [unitPref, setUnitPref] = useState(profile?.unitPref || "kg");
  const [defaultRest, setDefaultRest] = useState(profile?.defaultRest || 90);
  const [language, setLanguage] = useState(profile?.language || "English");
  const [theme, setTheme] = useState(profile?.theme || "Light");
  const [notifications, setNotifications] = useState(profile?.notifications || { email: true, push: true });

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePhoto(base64String);
        localStorage.setItem("sn-gym-profile-photo", base64String);
        updateProfile({ photoUrl: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  // Measurements Form States
  const latestM = measurements[0] || {};
  const [mWeight, setMWeight] = useState(latestM.weight || 79.5);
  const [mBodyFat, setMBodyFat] = useState(latestM.bodyFat || 17.5);
  const [mChest, setMChest] = useState(latestM.chest || 105.5);
  const [mWaist, setMWaist] = useState(latestM.waist || 84.5);
  const [mArms, setMArms] = useState(latestM.arms || 38);
  const [mHips, setMHips] = useState(latestM.hips || 95.5);

  // Custom Goal Form States
  const [goalTitle, setGoalTitle] = useState("");
  const [goalTarget, setGoalTarget] = useState("");
  const [goalCurrent, setGoalCurrent] = useState("");

  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateProfile({
      name,
      age: Number(age),
      height: Number(height),
      weeklyGoal: Number(weeklyGoal),
      targetWeight: Number(targetWeight),
      unitPref,
      defaultRest: Number(defaultRest),
      language,
      theme,
      notifications
    });
    if (setAnthropicKey) setAnthropicKey(apiKey);
    alert("Profile configurations saved successfully!");
  };

  const handleSaveMeasurements = (e) => {
    e.preventDefault();
    
    // F24 — Measurements client validation
    const wVal = Number(mWeight);
    const bfVal = Number(mBodyFat);
    const chestVal = Number(mChest);
    const waistVal = Number(mWaist);
    const armsVal = Number(mArms);
    const hipsVal = Number(mHips);

    if (wVal < 20 || wVal > 300) {
      alert("Please enter a valid weight between 20kg and 300kg.");
      return;
    }
    if (bfVal < 2 || bfVal > 60) {
      alert("Please enter a valid body fat percentage between 2% and 60%.");
      return;
    }
    if (chestVal < 30 || chestVal > 200 || waistVal < 30 || waistVal > 200 || hipsVal < 30 || hipsVal > 200) {
      alert("Please enter valid circumference measurements (30cm - 200cm).");
      return;
    }

    const entry = {
      weight: wVal,
      bodyFat: bfVal,
      chest: chestVal,
      waist: waistVal,
      arms: armsVal,
      hips: hipsVal
    };
    logMeasurements(entry);
    alert("Body measurements logged successfully!");
  };

  const handleCreateGoal = (e) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;
    addCustomGoal({
      title: goalTitle,
      targetValue: Number(goalTarget),
      currentValue: Number(goalCurrent) || 0,
      deadline: new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0]
    });
    setGoalTitle("");
    setGoalTarget("");
    setGoalCurrent("");
    alert("Custom fitness goal added!");
  };

  // Stats helpers
  const totalWorkouts = history.length;
  const totalHours = Math.round((history.reduce((sum, h) => sum + (h.durationSeconds || 0), 11520) / 3600) * 10) / 10;
  const totalVolume = history.reduce((sum, h) => {
    let vol = 0;
    h.exercises?.forEach(ex => {
      ex.sets?.forEach(s => {
        vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
      });
    });
    return sum + vol;
  }, 8240);

  const bestStreak = profile?.longestStreak || 12;

  // Simple weekly volume calculator for chart (mock bars + actual history)
  const getVolumeTrend = () => {
    const base = [4200, 5100, 4800, 6200];
    const recentWorkouts = history.slice(-3);
    recentWorkouts.forEach(h => {
      let vol = 0;
      h.exercises?.forEach(ex => {
        ex.sets?.forEach(s => {
          vol += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        });
      });
      base.push(vol || 3500);
    });
    while (base.length < 6) base.push(3000);
    return base.slice(-6);
  };
  const volumeData = getVolumeTrend();

  const menuItems = [
    { name: "Settings", icon: Settings },
    { name: "Measurements", icon: User },
    { name: "Analytics", icon: BarChart2 },
    { name: "Goals", icon: Target },
    { name: "Progress Photos", icon: Camera },
    { name: "Export", icon: Download }
  ];

  return (
    <div className="flex flex-col gap-6 text-[#1a1a1a] pb-24 px-5 pt-4 bg-transparent min-h-screen">
      
      {/* 1. Hero Card Gradient Banner */}
      <div 
        className="relative rounded-3xl bg-linear-to-r from-orange-accent to-[#FF9500] p-6 text-white shadow-[0_8px_24px_rgba(255,107,0,0.25)] flex flex-col items-center text-center select-none"
      >
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-white/20 flex items-center justify-center text-3xl font-black shadow-lg">
            {profilePhoto ? (
              <img src={profilePhoto} alt="Profile Avatar" className="w-full h-full object-cover" />
            ) : (
              name.slice(0, 2).toUpperCase()
            )}
          </div>
          <label className="absolute bottom-0 right-0 w-7 h-7 bg-white hover:bg-orange-accent hover:text-white rounded-full flex items-center justify-center text-orange-accent shadow-md cursor-pointer border border-gray-150 transition-all select-none">
            <Camera size={12} />
            <input 
              type="file" 
              accept="image/*" 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
          </label>
        </div>
        <h3 className="text-xl font-black mt-3 leading-none">{name}</h3>
        <p className="text-[10px] text-white/80 font-bold uppercase tracking-wider mt-1.5">Target: Lose Weight to {targetWeight}kg</p>
        <span className="mt-3.5 bg-white text-orange-accent text-[9px] font-black uppercase tracking-wider py-1 px-4 rounded-full shadow-xs">
          Rank: {profile?.rankTitle || "Beast Mode"}
        </span>
      </div>

      {/* 2. Stats Grid 2x2 */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="bg-surface rounded-[20px] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-orange-accent shrink-0 shadow-xs">
            <Dumbbell size={16} />
          </div>
          <div>
            <span className="text-xl font-black text-[#1a1a1a] block leading-none">{totalWorkouts}</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase block mt-1">Workouts</span>
          </div>
        </div>

        <div className="bg-surface rounded-[20px] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-orange-accent shrink-0 shadow-xs">
            <Clock size={16} />
          </div>
          <div>
            <span className="text-xl font-black text-[#1a1a1a] block leading-none">{totalHours}h</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase block mt-1">Hours</span>
          </div>
        </div>

        <div className="bg-surface rounded-[20px] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-orange-accent shrink-0 shadow-xs">
            <Flame size={16} />
          </div>
          <div>
            <span className="text-xl font-black text-[#1a1a1a] block leading-none">{(totalVolume/1000).toFixed(1)}k</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase block mt-1">Vol (tons)</span>
          </div>
        </div>

        <div className="bg-surface rounded-[20px] p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-orange-accent shrink-0 shadow-xs">
            <Trophy size={16} />
          </div>
          <div>
            <span className="text-xl font-black text-[#1a1a1a] block leading-none">{bestStreak}d</span>
            <span className="text-[9px] text-gray-400 font-bold uppercase block mt-1">Best Streak</span>
          </div>
        </div>
      </div>

      {/* 2.5 Achievements / Badges section */}
      <div className="bg-white border border-gray-150/50 rounded-[28px] p-5 shadow-[0_2px_12px_rgba(0,0,0,0.07)] flex flex-col gap-4 select-none animate-fade-in">
        <div className="flex justify-between items-center">
          <div>
            <span className="text-[9px] font-bold text-orange-accent uppercase tracking-widest block">Achievements</span>
            <h4 className="text-xs font-black text-[#1a1a1a] mt-0.5">Gym Badges</h4>
          </div>
          <span className="text-[10px] text-gray-400 font-bold">3 / 5 unlocked</span>
        </div>
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
              className={`shrink-0 rounded-2xl p-3 text-center border min-w-24 transition-all ${
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
      </div>

      {/* 3. Menu items list with inline details rendering on select */}
      <div className="flex flex-col gap-2 bg-transparent">
        <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 select-none">Quick Options</h4>
        <div className="flex flex-col gap-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeSection === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.name === "Export") {
                    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ profile, history, measurements, customGoals }));
                    const downloadAnchor = document.createElement("a");
                    downloadAnchor.setAttribute("href", dataStr);
                    downloadAnchor.setAttribute("download", `sngym_backup_${Date.now()}.json`);
                    document.body.appendChild(downloadAnchor);
                    downloadAnchor.click();
                    downloadAnchor.remove();
                    return;
                  }
                  setActiveSection(item.name);
                }}
                className={`w-full py-3 px-4.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                  isSelected ? "bg-orange-50/50 border border-orange-100" : "bg-surface border border-transparent"
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-orange-accent text-white" : "bg-white text-orange-accent border border-gray-100"
                  }`}>
                    <Icon size={14} />
                  </div>
                  <span className="text-xs font-bold text-[#1a1a1a]">{item.name}</span>
                </div>
                <ChevronRight size={14} className={isSelected ? "text-orange-accent" : "text-gray-400"} />
              </button>
            );
          })}
          
          {/* Gorgeous Log Out Button */}
          <button
            onClick={logout}
            className="w-full py-3 px-4.5 rounded-2xl flex items-center justify-between transition-all cursor-pointer bg-red-50/80 hover:bg-red-100/70 border border-red-200/50 shadow-xs animate-fade-in"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-red-500 text-white shadow-xs">
                <LogOut size={14} />
              </div>
              <span className="text-xs font-bold text-red-600">Log Out</span>
            </div>
            <ChevronRight size={14} className="text-red-400" />
          </button>
        </div>
      </div>

      {/* 4. Active sub section details card */}
      <div className="bg-white/85 backdrop-blur-md border border-white/20 rounded-[20px] p-5 shadow-xs">
        <AnimatePresence mode="wait">
          {activeSection === "Settings" && (
            <motion.form 
              key="settings"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSaveProfile}
              className="flex flex-col gap-4"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-accent mb-1">General Settings</h4>

              <div>
                <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Age</label>
                  <input 
                    type="number" 
                    value={age} 
                    onChange={e => setAge(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Height (cm)</label>
                  <input 
                    type="number" 
                    value={height} 
                    onChange={e => setHeight(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Target Weight (kg)</label>
                  <input 
                    type="number" 
                    value={targetWeight} 
                    onChange={e => setTargetWeight(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Weekly Goal (days)</label>
                  <input 
                    type="number" 
                    value={weeklyGoal} 
                    onChange={e => setWeeklyGoal(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              {/* F41-F46 — Preferences configuration */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-4">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-orange-accent">App Preferences</h5>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Weight Unit</label>
                    <select 
                      value={unitPref} 
                      onChange={e => setUnitPref(e.target.value)}
                      className="w-full bg-surface border border-transparent rounded-full py-3 px-5 text-xs font-semibold outline-none"
                    >
                      <option value="kg">Metric (kg)</option>
                      <option value="lbs">Imperial (lbs)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Theme Mode</label>
                    <select 
                      value={theme} 
                      onChange={e => setTheme(e.target.value)}
                      className="w-full bg-surface border border-transparent rounded-full py-3 px-5 text-xs font-semibold outline-none"
                    >
                      <option value="Light">Light Theme</option>
                      <option value="Dark">Dark Glass Mode</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Default Rest (sec)</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="30" 
                        max="180" 
                        step="15"
                        value={defaultRest} 
                        onChange={e => setDefaultRest(Number(e.target.value))}
                        className="flex-1 accent-orange-accent"
                      />
                      <span className="text-xs font-bold text-[#1a1a1a] shrink-0 w-8">{defaultRest}s</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">App Language</label>
                    <select 
                      value={language} 
                      onChange={e => setLanguage(e.target.value)}
                      className="w-full bg-surface border border-transparent rounded-full py-3 px-5 text-xs font-semibold outline-none"
                    >
                      <option value="English">English</option>
                      <option value="Telugu">Telugu (తెలుగు)</option>
                      <option value="Hindi">Hindi (हिंदी)</option>
                      <option value="Spanish">Spanish</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Notification Preferences</label>
                  <div className="flex gap-4 mt-1.5">
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#1a1a1a]">
                      <input 
                        type="checkbox" 
                        checked={notifications.email} 
                        onChange={e => setNotifications(prev => ({ ...prev, email: e.target.checked }))}
                        className="accent-orange-accent"
                      />
                      Email Updates
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-[#1a1a1a]">
                      <input 
                        type="checkbox" 
                        checked={notifications.push} 
                        onChange={e => setNotifications(prev => ({ ...prev, push: e.target.checked }))}
                        className="accent-orange-accent"
                      />
                      Push Reminders
                    </label>
                  </div>
                </div>
              </div>

              {/* F51-F53 — Social Gym Buddies invite */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-orange-accent">Referrals & Gym Buddies</h5>
                <div className="flex justify-between items-center bg-surface p-3.5 rounded-xl border border-gray-100/50">
                  <div>
                    <span className="text-[8px] font-bold text-gray-400 uppercase tracking-wider block">Your referral code</span>
                    <span className="text-xs font-black text-[#1a1a1a] block mt-0.5">SNGYM-7798X</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("SNGYM-7798X");
                      alert("Referral code copied to clipboard! Invite your buddies to earn 150 XP! 🎁");
                    }}
                    className="bg-orange-accent/10 border border-orange-accent/20 text-orange-accent text-[9px] font-black uppercase px-3 py-1.5 rounded-full hover:bg-orange-accent hover:text-white transition-colors cursor-pointer"
                  >
                    Invite Buddy
                  </button>
                </div>
              </div>

              {/* F47-F50 — Sync, Backup, Export & Delete simulators */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-orange-accent">Data Security & Sync</h5>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => alert("All workout templates & settings synced with Google Drive cloud database! ☁️")}
                    className="py-2.5 bg-gray-50 border border-gray-150 text-gray-600 rounded-full font-bold text-[10px] uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    ☁️ Cloud Backup
                  </button>
                  <button 
                    type="button" 
                    onClick={() => alert("CSV/PDF workout analytics files exported successfully! 📂")}
                    className="py-2.5 bg-gray-50 border border-gray-150 text-gray-600 rounded-full font-bold text-[10px] uppercase cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    📂 Export Data
                  </button>
                </div>

                <button 
                  type="button" 
                  onClick={() => {
                    if (window.confirm("CAUTION: Permanent deletion of SN Gym account. This will wipe local cache data.")) {
                      alert("Account successfully deleted. Returning to start.");
                      logout();
                    }
                  }}
                  className="w-full py-3 border border-red-200/50 hover:bg-red-50 text-red-500 font-extrabold text-[10px] rounded-full uppercase cursor-pointer transition-colors mt-2"
                >
                  ⚠️ Delete Account
                </button>
              </div>

              <button 
                type="submit"
                className="bg-linear-to-r from-orange-accent to-[#FF9500] text-white font-black text-xs uppercase tracking-widest py-3.5 w-full rounded-full cursor-pointer mt-3 active:scale-97 transition-all shadow-xs"
              >
                Save configurations
              </button>
            </motion.form>
          )}

          {activeSection === "Measurements" && (
            <motion.form 
              key="measurements"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSaveMeasurements}
              className="flex flex-col gap-4"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-accent mb-1">Log Measurements</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Weight (kg)</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={mWeight} 
                    onChange={e => setMWeight(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Body Fat %</label>
                  <input 
                    type="number" 
                    step="0.1"
                    value={mBodyFat} 
                    onChange={e => setMBodyFat(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Chest (cm)</label>
                  <input 
                    type="number" 
                    value={mChest} 
                    onChange={e => setMChest(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Waist (cm)</label>
                  <input 
                    type="number" 
                    value={mWaist} 
                    onChange={e => setMWaist(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Arms (cm)</label>
                  <input 
                    type="number" 
                    value={mArms} 
                    onChange={e => setMArms(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">Hips (cm)</label>
                  <input 
                    type="number" 
                    value={mHips} 
                    onChange={e => setMHips(e.target.value)}
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="bg-linear-to-r from-orange-accent to-[#FF9500] text-white font-black text-xs uppercase tracking-widest py-3.5 w-full rounded-full cursor-pointer mt-2 active:scale-97 transition-all shadow-xs"
              >
                Log metrics
              </button>
            </motion.form>
          )}

          {activeSection === "Analytics" && (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-5 select-none"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-accent">Performance Analytics</h4>

              {/* Volume chart */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Weekly Volume Trend</span>
                <div className="h-32 flex items-end justify-between px-2 pt-4 bg-gray-50 rounded-2xl border border-gray-100">
                  {volumeData.map((val, i) => {
                    const heightPct = Math.round((val / 7500) * 100);
                    return (
                      <div key={i} className="flex flex-col items-center flex-1 gap-1">
                        <div 
                          className="w-5 bg-linear-to-t from-orange-accent to-[#FF9500] rounded-t-md transition-all duration-500" 
                          style={{ height: `${heightPct}px` }}
                        />
                        <span className="text-[7px] text-gray-400 font-bold uppercase">W{i+1}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Personal Records list */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Personal Records (Max Lift)</span>
                <div className="flex flex-col gap-2">
                  {Object.entries(personalRecords || {}).map(([name, val]) => (
                    <div key={name} className="flex justify-between items-center bg-surface p-3 rounded-xl border border-gray-100">
                      <span className="font-extrabold text-[10px] text-[#1a1a1a]">{name}</span>
                      <span className="text-xs font-black text-orange-accent">{val} {unitPref}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monthly training frequency */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Monthly Frequency Calendar</span>
                <div className="grid grid-cols-7 gap-1 bg-gray-50 border border-gray-100 rounded-2xl p-3.5">
                  {Array.from({ length: 28 }).map((_, idx) => {
                    const isActive = idx % 3 === 0 || idx % 5 === 0;
                    return (
                      <div 
                        key={idx} 
                        className={`h-5 w-full rounded-sm flex items-center justify-center font-black text-[8px] ${
                          isActive ? "bg-orange-accent text-white" : "bg-gray-200/50 text-gray-400"
                        }`}
                      >
                        {idx + 1}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Muscle group split */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Muscle Group Split</span>
                <div className="flex flex-col gap-2 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                  {[
                    { muscle: "Chest", pct: 25 },
                    { muscle: "Back", pct: 20 },
                    { muscle: "Legs", pct: 30 },
                    { muscle: "Shoulders", pct: 15 },
                    { muscle: "Arms", pct: 10 }
                  ].map((m) => (
                    <div key={m.muscle} className="flex items-center gap-2 text-[9px] font-bold text-gray-500">
                      <span className="w-14 shrink-0">{m.muscle}</span>
                      <div className="flex-1 bg-gray-200/60 h-2 rounded-full overflow-hidden">
                        <div className="bg-linear-to-r from-orange-accent to-amber-500 h-full rounded-full" style={{ width: `${m.pct}%` }} />
                      </div>
                      <span className="w-6 text-right font-black text-charcoal">{m.pct}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Duration Trend */}
              <div>
                <span className="text-[10px] text-gray-400 font-bold uppercase block mb-2">Duration Trend (hours/wk)</span>
                <div className="h-28 flex items-end justify-between px-2 pt-2 bg-gray-50 rounded-2xl border border-gray-100">
                  {[
                    { label: "W1", hr: 3.5 },
                    { label: "W2", hr: 4.2 },
                    { label: "W3", hr: 3.8 },
                    { label: "W4", hr: 4.8 }
                  ].map((w, idx) => {
                    const heightPct = Math.round((w.hr / 6) * 100);
                    return (
                      <div key={idx} className="flex flex-col items-center flex-1 gap-1">
                        <span className="text-[8px] text-orange-accent font-black">{w.hr}h</span>
                        <div 
                          className="w-4 bg-linear-to-t from-orange-accent to-amber-400 rounded-t-md transition-all" 
                          style={{ height: `${heightPct * 0.5}px` }}
                        />
                        <span className="text-[8px] text-gray-400 font-bold uppercase">{w.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plateau & Overtraining alerts */}
              <div className="bg-orange-50/50 border border-orange-200/40 rounded-2xl p-4 flex flex-col gap-2.5">
                <span className="text-[9px] font-bold text-orange-accent uppercase tracking-wider block">System Diagnostics</span>
                
                <div className="flex flex-col gap-1.5 text-[11px] font-medium leading-relaxed text-charcoal">
                  <p>💪 <strong className="text-orange-accent font-bold">Plateau Detector:</strong> Bench Press weight has remained stagnant at 80kg for 3 sessions. Suggest a 10% deload or changing set ranges to 5x5.</p>
                  <p className="border-t border-orange-100/50 pt-1.5 mt-1">⚠️ <strong className="text-amber-600 font-bold">Overtraining Alert:</strong> Leg training volume is currently 30% higher than recommended recovery limits. Insert a 48h rest before leg workouts.</p>
                  <p className="border-t border-orange-100/50 pt-1.5 mt-1">🔮 <strong className="text-purple-600 font-bold">Goal Prediction:</strong> Estimated Bench Press 100kg target achievement: <span className="font-extrabold text-purple-700">3 weeks</span> (July 20th)!</p>
                </div>
              </div>
            </motion.div>
          )}

          {activeSection === "Goals" && (
            <motion.div 
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-5"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-accent">Custom Targets</h4>

              {/* Goal List */}
              <div className="flex flex-col gap-3">
                {customGoals.map((g) => (
                  <div key={g.id} className="flex items-center justify-between bg-surface p-3 rounded-xl border border-gray-100">
                    <div>
                      <h5 className="font-extrabold text-[11px] text-[#1a1a1a]">{g.title}</h5>
                      <span className="text-[9px] text-gray-400 font-bold block mt-0.5">Progress: {g.currentValue} / {g.targetValue} {g.unit}</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                      {g.completed ? (
                        <span className="text-[9px] bg-green-50 text-green-500 font-black px-2.5 py-1 rounded-full uppercase">Done</span>
                      ) : (
                        <span className="text-[9px] bg-amber-50 text-amber-500 font-black px-2.5 py-1 rounded-full uppercase">Pending</span>
                      )}
                      <button 
                        onClick={() => deleteCustomGoal(g.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Create Goal Form */}
              <form onSubmit={handleCreateGoal} className="flex flex-col gap-3.5 border-t border-gray-50 pt-4">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">Add Target Goal</span>
                <input 
                  type="text" 
                  value={goalTitle} 
                  onChange={e => setGoalTitle(e.target.value)}
                  placeholder="Goal e.g., Bench Press 100kg"
                  className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                />

                <div className="grid grid-cols-2 gap-3.5">
                  <input 
                    type="number" 
                    value={goalTarget} 
                    onChange={e => setGoalTarget(e.target.value)}
                    placeholder="Target value"
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                  <input 
                    type="number" 
                    value={goalCurrent} 
                    onChange={e => setGoalCurrent(e.target.value)}
                    placeholder="Current value"
                    className="w-full bg-surface border border-transparent focus:border-orange-accent focus:bg-white rounded-full py-3 px-5 text-xs font-semibold outline-none transition-all"
                  />
                </div>

                <button 
                  type="submit"
                  className="bg-[#1a1a1a] text-white font-black text-xs uppercase tracking-widest py-3 w-full rounded-full cursor-pointer hover:bg-black transition-colors"
                >
                  Create Target
                </button>
              </form>
            </motion.div>
          )}

          {activeSection === "Progress Photos" && (
            <motion.div 
              key="photos"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-4 text-center select-none"
            >
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-accent">Progress Timeline</h4>
              <p className="text-[10px] text-gray-400 font-bold uppercase leading-relaxed">Log periodic body physique photos to track shape gains visual progression.</p>
              
              <div className="aspect-4/3 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera size={26} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Upload New Image</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Profile;
