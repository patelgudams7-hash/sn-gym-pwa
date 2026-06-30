import React, { createContext, useContext, useEffect, useRef } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { useAuth } from "./AuthContext";
import { defaultPlans } from "../data/defaultPlans";
import { mockMeasurements } from "../data/mockMeasurements";
import indianRecipes from "../data/indianRecipes.json";
import dietFlowDataset from "../data/dietFlowDataset.json";
import {
  loadUserData,
  bootstrapNewUser,
  saveProfile,
  savePlanFS,
  deletePlanFS,
  saveWorkoutHistory,
  saveMeasurement,
  saveGoalFS,
  deleteGoalFS,
  saveDietDay,
  saveWeeklyDiet,
  saveSettings
} from "../firebase/firestoreService";


const GymContext = createContext(null);

export const useGym = () => {
  const context = useContext(GymContext);
  if (!context) {
    throw new Error("useGym must be used within a GymProvider");
  }
  return context;
};

export const GymProvider = ({ children }) => {
  // 1. User Profile state (now with streak, xp, level, rank details)
  const [profile, setProfile] = useLocalStorage("sn_gym_profile", {
    name: "Warrior",
    age: 26,
    height: 180,
    weight: 79.5,
    targetWeight: 75.0,
    unitPref: {
      weight: "kg",
      length: "cm"
    },
    weeklyGoal: 4,
    currentStreak: 5,
    longestStreak: 12,
    xp: 1850,
    level: 4,
    rankTitle: "Beast Mode",
    badges: ["Early Bird", "Consistency King", "Iron Master", "Water Champion"],
    lockedBadges: ["PR Destroyer", "Perfect Week", "Fasting Master", "Plate Crusher"]
  });

  // 2. Custom & Default Workout Plans
  const [plans, setPlans] = useLocalStorage("sn_gym_plans", defaultPlans);

  // 3. Workout History Logs
  const [history, setHistory] = useLocalStorage("sn_gym_history", [
    {
      id: "hist-1",
      planId: "plan-push",
      planName: "Apex Push Day",
      date: "2026-06-22",
      durationSeconds: 2700, // 45 mins
      caloriesBurned: 450,
      setsCompletedCount: 13,
      mood: "Energized"
    },
    {
      id: "hist-2",
      planId: "plan-legs",
      planName: "Sculpted Legs & Core",
      date: "2026-06-24",
      durationSeconds: 2100, // 35 mins
      caloriesBurned: 320,
      setsCompletedCount: 9,
      mood: "Focused"
    }
  ]);

  // 4. Body Measurements timeline
  const [measurements, setMeasurements] = useLocalStorage("sn_gym_measurements", mockMeasurements);

  // 5. Personal Records (Exercise -> Max Weight lifted)
  const [personalRecords, setPersonalRecords] = useLocalStorage("sn_gym_records", {
    "Barbell Bench Press": 75,
    "Dumbbell Shoulder Press": 18,
    "Barbell Bent Over Row": 60,
    "Barbell Full Squat": 50
  });

  // 6. APEX Coach Chat History State
  const [chatHistory, setChatHistory] = useLocalStorage("sngym_chat_history", [
    {
      id: "initial",
      sender: "apex",
      text: "Welcome to SN GYM! I am APEX, your elite personal fitness coach. Ask me anything about your workout, nutrition, form, or schedule. Let's crush your goals!",
      timestamp: new Date().toISOString()
    }
  ]);

  // 7. Anthropic API key
  const [anthropicKey, setAnthropicKey] = useLocalStorage("sngym_anthropic_key", "");

  // 8. Favorite Exercises
  const [favorites, setFavorites] = useLocalStorage("sngym_favorites", [
    "Barbell Bench Press",
    "Dumbbell Shoulder Press"
  ]);

  // 9. Recently Used Exercises
  const [recentlyUsed, setRecentlyUsed] = useLocalStorage("sngym_recently_used", [
    "Barbell Bench Press",
    "Pushups",
    "Dumbbell Bicep Curl"
  ]);

  // 10. Custom Goals with deadlines
  const [customGoals, setCustomGoals] = useLocalStorage("sngym_custom_goals", [
    { id: "goal-1", title: "Bench Press 100kg", targetValue: 100, currentValue: 75, unit: "kg", deadline: "2026-08-31", completed: false },
    { id: "goal-2", title: "Body Fat Target 12%", targetValue: 12, currentValue: 14.5, unit: "%", deadline: "2026-07-20", completed: false },
    { id: "goal-3", title: "Weekly Consistency Goal", targetValue: 4, currentValue: 3, unit: "sessions", deadline: "2026-06-28", completed: false }
  ]);

  // 11. Routine Day Schedule mapping (Day -> Plan ID)
  const [routineSchedule, setRoutineSchedule] = useLocalStorage("sngym_routine_schedule", {
    "Monday": "plan-push",
    "Wednesday": "plan-pull",
    "Friday": "plan-legs"
  });

  // 12. Intermittent Fasting state
  const [fastingState, setFastingState] = useLocalStorage("sngym_fasting_state", {
    isActive: false,
    startTime: null,
    durationHours: 16
  });

  // 13. Diet Plan meals database indexed by date 'YYYY-MM-DD'
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const [dietPlan, setDietPlan] = useLocalStorage("sngym_diet_plan", {
    [yesterdayStr]: {
      breakfast: [
        { id: "m-1", name: "Oats with Honey & Banana", cal: 380, protein: 12, carbs: 65, fat: 6 },
        { id: "m-2", name: "Boiled Eggs (3 whole)", cal: 210, protein: 18, carbs: 1, fat: 15 }
      ],
      lunch: [
        { id: "m-3", name: "Grilled Chicken Breast with Rice", cal: 520, protein: 42, carbs: 50, fat: 8 },
        { id: "m-4", name: "Moong Dal & Roti", cal: 310, protein: 14, carbs: 48, fat: 4 }
      ],
      dinner: [
        { id: "m-5", name: "Baked Salmon with Broccoli", cal: 420, protein: 35, carbs: 8, fat: 22 }
      ],
      snacks: [
        { id: "m-6", name: "Whey Protein Shake", cal: 140, protein: 25, carbs: 3, fat: 2 },
        { id: "m-7", name: "Mixed Almonds & Walnuts", cal: 180, protein: 6, carbs: 5, fat: 16 }
      ],
      waterIntake: 2500 // ml
    },
    [todayStr]: {
      breakfast: [
        { id: "t-1", name: "Masala Oats & Whey Protein", cal: 350, protein: 30, carbs: 40, fat: 5 }
      ],
      lunch: [
        { id: "t-2", name: "Paneer Bhurji & Roti (2)", cal: 480, protein: 22, carbs: 42, fat: 18 }
      ],
      dinner: [],
      snacks: [
        { id: "t-3", name: "Apple & Peanut Butter", cal: 220, protein: 7, carbs: 25, fat: 12 }
      ],
      waterIntake: 1500 // ml
    }
  });

  // 14. Weekly Diet Plan schedule templates (Mon-Sun)
  const [weeklyDietSchedule, setWeeklyDietSchedule] = useLocalStorage("sngym_weekly_diet_schedule", {
    "Monday": {
      breakfast: [
        { id: "w-mon-b1", name: "Ragi Millet Vermicelli Upma", cal: 310, protein: 9, carbs: 52, fat: 7 }
      ],
      lunch: [
        { id: "w-mon-l1", name: "Andhra Style Chicken Curry & Rice", cal: 540, protein: 36, carbs: 60, fat: 14 }
      ],
      dinner: [
        { id: "w-mon-d1", name: "Mixed Dal Tadka & Whole Wheat Roti", cal: 380, protein: 16, carbs: 54, fat: 8 }
      ],
      snacks: [
        { id: "w-mon-s1", name: "Roasted Masala Chana", cal: 160, protein: 8, carbs: 22, fat: 4 }
      ]
    },
    "Tuesday": {
      breakfast: [
        { id: "w-tue-b1", name: "High Protein Masala Oats", cal: 350, protein: 28, carbs: 45, fat: 6 }
      ],
      lunch: [
        { id: "w-tue-l1", name: "Paneer Tikka & Multigrain Chapati", cal: 490, protein: 24, carbs: 40, fat: 20 }
      ],
      dinner: [
        { id: "w-tue-d1", name: "Steamed Idli with Sambar & Chutney", cal: 340, protein: 10, carbs: 62, fat: 5 }
      ],
      snacks: [
        { id: "w-tue-s1", name: "Sliced Apple & Almond Butter", cal: 210, protein: 6, carbs: 24, fat: 11 }
      ]
    },
    "Wednesday": {
      breakfast: [
        { id: "w-wed-b1", name: "Egg Bhurji (3 eggs) & Toast", cal: 380, protein: 24, carbs: 22, fat: 18 }
      ],
      lunch: [
        { id: "w-wed-l1", name: "Palak Paneer Curry with Brown Rice", cal: 520, protein: 20, carbs: 58, fat: 19 }
      ],
      dinner: [
        { id: "w-wed-d1", name: "Grilled Lemon Fish & Steamed Broccoli", cal: 410, protein: 32, carbs: 12, fat: 22 }
      ],
      snacks: [
        { id: "w-wed-s1", name: "Spiced Buttermilk (Chaas)", cal: 75, protein: 3, carbs: 8, fat: 3 }
      ]
    },
    "Thursday": {
      breakfast: [
        { id: "w-thu-b1", name: "Moong Dal Cheela (2) with Mint Chutney", cal: 290, protein: 14, carbs: 44, fat: 6 }
      ],
      lunch: [
        { id: "w-thu-l1", name: "Tandoori Chicken Breast & Salad", cal: 460, protein: 42, carbs: 15, fat: 12 }
      ],
      dinner: [
        { id: "w-thu-d1", name: "Aloo Gobi Sabzi & Whole Wheat Roti", cal: 360, protein: 11, carbs: 58, fat: 8 }
      ],
      snacks: [
        { id: "w-thu-s1", name: "Mixed Unsalted Almonds & Walnuts", cal: 180, protein: 6, carbs: 5, fat: 16 }
      ]
    },
    "Friday": {
      breakfast: [
        { id: "w-fri-b1", name: "Oats Banana Honey Shake", cal: 390, protein: 12, carbs: 68, fat: 7 }
      ],
      lunch: [
        { id: "w-fri-l1", name: "Bengali Fish Curry (Maacher Jhol) & Rice", cal: 510, protein: 28, carbs: 62, fat: 13 }
      ],
      dinner: [
        { id: "w-fri-d1", name: "Soya Chunks Masala Curry & Roti", cal: 430, protein: 26, carbs: 48, fat: 12 }
      ],
      snacks: [
        { id: "w-fri-s1", name: "Boiled Egg (2 whole)", cal: 140, protein: 12, carbs: 1, fat: 10 }
      ]
    },
    "Saturday": {
      breakfast: [
        { id: "w-sat-b1", name: "Vegetable Poha with Peanuts", cal: 280, protein: 6, carbs: 46, fat: 8 }
      ],
      lunch: [
        { id: "w-sat-l1", name: "Kadahi Paneer Curry & Phulka (2)", cal: 520, protein: 21, carbs: 48, fat: 22 }
      ],
      dinner: [
        { id: "w-sat-d1", name: "Chicken Tikka Kebab & Mint Salad", cal: 390, protein: 38, carbs: 10, fat: 18 }
      ],
      snacks: [
        { id: "w-sat-s1", name: "Roasted Makhana (Lotus Seeds)", cal: 120, protein: 3, carbs: 20, fat: 3 }
      ]
    },
    "Sunday": {
      breakfast: [
        { id: "w-sun-b1", name: "Masala Rava Idli with Coconut Chutney", cal: 320, protein: 8, carbs: 54, fat: 8 }
      ],
      lunch: [
        { id: "w-sun-l1", name: "Hyderabadi Chicken Biryani (Lean)", cal: 620, protein: 34, carbs: 75, fat: 18 }
      ],
      dinner: [
        { id: "w-sun-d1", name: "Rajma Masala (Kidney Beans) & Rice", cal: 460, protein: 18, carbs: 72, fat: 10 }
      ],
      snacks: [
        { id: "w-sun-s1", name: "Apple Slices with Peanut Butter", cal: 220, protein: 7, carbs: 25, fat: 12 }
      ]
    }
  });

  // ─── Auth & Firestore sync ───────────────────────────────────────────────────
  const { user } = useAuth();
  const bootstrappedRef = useRef(false);

  useEffect(() => {
    if (!user) {
      // User logged out — reset bootstrapped flag (data stays in localStorage)
      bootstrappedRef.current = false;
      return;
    }

    const uid = user.uid;

    loadUserData(uid).then((cloudData) => {
      const realName = user.displayName || user.email?.split("@")[0] || "Warrior";
      
      if (!cloudData || !cloudData.profile) {
        // Brand-new user: initialize CLEAN state (no mock data) and bootstrap to Firestore
        if (!bootstrappedRef.current) {
          bootstrappedRef.current = true;
          
          const cleanProfile = {
            name: realName,
            age: 26,
            height: 180,
            weight: 79.5,
            targetWeight: 75.0,
            unitPref: {
              weight: "kg",
              length: "cm"
            },
            weeklyGoal: 4,
            currentStreak: 0,
            longestStreak: 0,
            xp: 0,
            level: 1,
            rankTitle: "Beginner",
            badges: [],
            lockedBadges: ["Early Bird", "Consistency King", "Iron Master", "Water Champion", "PR Destroyer", "Perfect Week", "Fasting Master", "Plate Crusher"]
          };
          
          const cleanPlans = defaultPlans;
          const cleanHistory = [];
          const cleanMeasurements = [];
          const cleanPRs = {};
          const cleanGoals = [];
          
          setProfile(cleanProfile);
          setPlans(cleanPlans);
          setHistory(cleanHistory);
          setMeasurements(cleanMeasurements);
          setPersonalRecords(cleanPRs);
          setCustomGoals(cleanGoals);
          
          bootstrapNewUser(uid, {
            profile: cleanProfile,
            plans: cleanPlans,
            history: cleanHistory,
            measurements: cleanMeasurements,
            goals: cleanGoals,
            dietPlan: {},
            weeklyDiet: {},
            settings: {
              routineSchedule: {
                "Monday": "plan-push",
                "Wednesday": "plan-pull",
                "Friday": "plan-legs"
              },
              fastingState: {
                isActive: false,
                startTime: null,
                durationHours: 16
              },
              anthropicKey: ""
            }
          });
        }
      } else {
        // Existing user: hydrate state from Firestore
        bootstrappedRef.current = true;
        
        let mergedProfile = { ...cloudData.profile };
        // Sync name if it's currently default 'Warrior' and real displayName is available
        if ((mergedProfile.name === "Warrior" || mergedProfile.name === "") && realName !== "Warrior") {
          mergedProfile.name = realName;
          saveProfile(uid, mergedProfile);
        }
        
        setProfile(mergedProfile);
        if (cloudData.plans?.length) setPlans(cloudData.plans);
        setHistory(cloudData.history || []);
        setMeasurements(cloudData.measurements || []);
        setCustomGoals(cloudData.goals || []);
        if (cloudData.dietPlan) setDietPlan(cloudData.dietPlan);
        if (cloudData.weeklyDiet) {
          const { updatedAt, ...schedule } = cloudData.weeklyDiet;
          setWeeklyDietSchedule(schedule);
        }
        if (cloudData.settings) {
          const { routineSchedule: rs, fastingState: fs, anthropicKey: ak } = cloudData.settings;
          if (rs) setRoutineSchedule(rs);
          if (fs) setFastingState(fs);
          if (ak !== undefined) setAnthropicKey(ak);
        }
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ─── Actions ─────────────────────────────────────────────────────────────────

  // Action: Update profile details
  const updateProfile = (updatedProfile) => {
    setProfile(prev => {
      const next = { ...prev, ...updatedProfile };
      if (user) saveProfile(user.uid, next);
      return next;
    });
  };

  // Action: Add new completed workout to history, update stats & check PRs
  const logWorkout = (completedWorkout) => {
    const dateStr = new Date().toISOString().split("T")[0];
    
    let totalCompletedSets = 0;
    let newPRsFound = false;
    let volumeSession = 0;
    const tempPRs = { ...personalRecords };

    completedWorkout.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) {
          totalCompletedSets += 1;
          const weightNum = Number(s.weight) || 0;
          const repsNum = Number(s.reps) || 0;
          volumeSession += weightNum * repsNum;
          if (weightNum > 0) {
            const currentRecord = tempPRs[ex.name] || 0;
            if (weightNum > currentRecord) {
              tempPRs[ex.name] = weightNum;
              newPRsFound = true;
            }
          }
        }
      });
    });

    if (newPRsFound) {
      setPersonalRecords(tempPRs);
    }

    const minutes = completedWorkout.durationSeconds / 60;
    const caloriesBurned = Math.round(minutes * 9.5);

    const newHistoryEntry = {
      id: `hist-${Date.now()}`,
      planId: completedWorkout.planId,
      planName: completedWorkout.planName,
      date: dateStr,
      durationSeconds: completedWorkout.durationSeconds,
      caloriesBurned,
      setsCompletedCount: totalCompletedSets,
      mood: completedWorkout.mood || "Focused",
      exercises: completedWorkout.exercises.map(ex => ({
        name: ex.name,
        sets: ex.sets.map(s => ({ reps: s.reps, weight: s.weight, completed: s.completed }))
      }))
    };

    setHistory(prev => [newHistoryEntry, ...prev]);
    // Firestore: persist workout history entry
    if (user) saveWorkoutHistory(user.uid, newHistoryEntry);

    // Update aggregate streaks & level XP
    setProfile(prev => {
      const isNewActiveDay = !history.some(h => h.date === dateStr);
      let newStreak = prev.currentStreak;
      let newLongest = prev.longestStreak;
      if (isNewActiveDay) {
        newStreak = prev.currentStreak + 1;
        if (newStreak > prev.longestStreak) {
          newLongest = newStreak;
        }
      }
      
      const newXp = prev.xp + 150; // 150 XP per completed workout
      const calculatedLevel = Math.floor(newXp / 500) + 1;
      const next = {
        ...prev,
        currentStreak: newStreak,
        longestStreak: newLongest,
        xp: newXp,
        level: calculatedLevel,
        rankTitle: calculatedLevel >= 5 ? "Beast Mode" : calculatedLevel >= 3 ? "Elite Lifter" : "Beginner"
      };
      if (user) saveProfile(user.uid, next);
      return next;
    });

    // Update goal checklist weekly count
    updateGoalProgress("goal-3", 1);
  };

  // Action: Add custom workout plan (or overwrite an existing one)
  const savePlan = (plan) => {
    setPlans(prev => {
      const exists = prev.some(p => p.id === plan.id);
      if (exists) return prev.map(p => p.id === plan.id ? plan : p);
      return [...prev, plan];
    });
    // Firestore: persist plan
    if (user) savePlanFS(user.uid, plan);
  };

  // Action: Delete a workout plan
  const deletePlan = (planId) => {
    setPlans(prev => prev.filter(p => p.id !== planId));
    // Firestore: remove plan doc
    if (user) deletePlanFS(user.uid, planId);
  };

  // Action: Duplicate an existing template plan
  const duplicatePlan = (planId) => {
    const planToCopy = plans.find(p => p.id === planId);
    if (!planToCopy) return;
    const copied = {
      ...planToCopy,
      id: `plan-copy-${Date.now()}`,
      name: `${planToCopy.name} (Copy)`
    };
    savePlan(copied);
  };

  // Action: Schedule a routine day mapping
  const scheduleRoutine = (dayOfWeek, planId) => {
    const next = { ...routineSchedule, [dayOfWeek]: planId };
    setRoutineSchedule(next);
    // Firestore: persist settings
    if (user) saveSettings(user.uid, { routineSchedule: next, fastingState, anthropicKey });
  };

  // Action: Add new body measurements entry
  const logMeasurements = (newMeasure) => {
    const dateStr = new Date().toISOString().split("T")[0];
    const entry = { date: dateStr, ...newMeasure };
    
    setMeasurements(prev => {
      const filtered = prev.filter(m => m.date !== dateStr);
      return [entry, ...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));
    });
    // Firestore: persist measurement
    if (user) saveMeasurement(user.uid, entry);

    if (newMeasure.weight) {
      setProfile(prev => {
        const next = { ...prev, weight: Number(newMeasure.weight) };
        if (user) saveProfile(user.uid, next);
        return next;
      });
      updateGoalProgress("goal-2", Number(newMeasure.weight));
    }
  };

  // Action: Import custom plan JSON
  const importPlan = (planJsonString) => {
    try {
      const plan = JSON.parse(planJsonString);
      if (!plan.name || !Array.isArray(plan.exercises)) {
        throw new Error("Invalid plan template format.");
      }
      const imported = {
        ...plan,
        id: `plan-import-${Date.now()}`,
        difficulty: plan.difficulty || "Intermediate",
        duration: plan.duration || 45,
        category: plan.category || "Custom"
      };
      savePlan(imported);
      return { success: true, plan: imported };
    } catch (e) {
      return { success: false, error: e.message };
    }
  };

  // Action: Add chat message to conversation
  const addChatMessage = (sender, text) => {
    const newMsg = {
      id: `chat-${Date.now()}`,
      sender,
      text,
      timestamp: new Date().toISOString()
    };
    setChatHistory(prev => [...prev, newMsg]);
  };

  // Action: Clear chat history
  const clearChatHistory = () => {
    setChatHistory([
      {
        id: "initial",
        sender: "apex",
        text: "Conversation history cleared. APEX is ready for your questions!",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  // Action: Toggle exercise favorite status
  const toggleFavorite = (exerciseName) => {
    setFavorites(prev => {
      if (prev.includes(exerciseName)) {
        return prev.filter(f => f !== exerciseName);
      }
      return [...prev, exerciseName];
    });
  };

  // Action: Add to recently used exercise stack
  const addRecentlyUsed = (exerciseName) => {
    setRecentlyUsed(prev => {
      const filtered = prev.filter(r => r !== exerciseName);
      return [exerciseName, ...filtered].slice(0, 10);
    });
  };

  // Action: Add custom goal
  const addCustomGoal = (goal) => {
    const newGoal = {
      id: `goal-${Date.now()}`,
      title: goal.title,
      targetValue: Number(goal.targetValue),
      currentValue: Number(goal.currentValue) || 0,
      unit: goal.unit || "kg",
      deadline: goal.deadline || new Date(Date.now() + 30 * 86400000).toISOString().split("T")[0],
      completed: false
    };
    setCustomGoals(prev => [...prev, newGoal]);
    // Firestore: persist goal
    if (user) saveGoalFS(user.uid, newGoal);
  };

  // Action: Delete custom goal
  const deleteCustomGoal = (goalId) => {
    setCustomGoals(prev => prev.filter(g => g.id !== goalId));
    // Firestore: remove goal doc
    if (user) deleteGoalFS(user.uid, goalId);
  };

  // Action: Update goal checklist progress value
  const updateGoalProgress = (goalId, value) => {
    setCustomGoals(prev => prev.map(g => {
      if (g.id !== goalId) return g;
      let newCurrentVal = g.currentValue;
      if (g.id === "goal-3") {
        newCurrentVal = g.currentValue + value;
      } else {
        newCurrentVal = value;
      }
      const completed = g.id === "goal-2" 
        ? newCurrentVal <= g.targetValue
        : newCurrentVal >= g.targetValue;
      const updated = { ...g, currentValue: newCurrentVal, completed };
      // Firestore: persist updated goal
      if (user) saveGoalFS(user.uid, updated);
      return updated;
    }));
  };

  // Action: Log diet meal item
  const logMeal = (date, mealType, foodItem) => {
    const dateKey = date || new Date().toISOString().split("T")[0];
    setDietPlan(prev => {
      const dayData = prev[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [], waterIntake: 0 };
      const list = dayData[mealType] || [];
      const item = {
        id: `meal-item-${Date.now()}`,
        name: foodItem.name,
        cal: Number(foodItem.cal) || 0,
        protein: Number(foodItem.protein) || 0,
        carbs: Number(foodItem.carbs) || 0,
        fat: Number(foodItem.fat) || 0
      };
      const newDay = { ...dayData, [mealType]: [...list, item] };
      const next = { ...prev, [dateKey]: newDay };
      // Firestore: persist updated day
      if (user) saveDietDay(user.uid, dateKey, newDay);
      return next;
    });
  };

  // Action: Delete logged meal item
  const deleteMealItem = (date, mealType, itemId) => {
    const dateKey = date || new Date().toISOString().split("T")[0];
    setDietPlan(prev => {
      const dayData = prev[dateKey];
      if (!dayData) return prev;
      const updated = (dayData[mealType] || []).filter(i => i.id !== itemId);
      const newDay = { ...dayData, [mealType]: updated };
      const next = { ...prev, [dateKey]: newDay };
      // Firestore: persist updated day
      if (user) saveDietDay(user.uid, dateKey, newDay);
      return next;
    });
  };

  // Action: Log water intake
  const logWater = (date, amountMl) => {
    const dateKey = date || new Date().toISOString().split("T")[0];
    setDietPlan(prev => {
      const dayData = prev[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [], waterIntake: 0 };
      const newDay = { ...dayData, waterIntake: (dayData.waterIntake || 0) + amountMl };
      const next = { ...prev, [dateKey]: newDay };
      // Firestore: persist updated day
      if (user) saveDietDay(user.uid, dateKey, newDay);
      return next;
    });
  };

  // Action: Fasting timer start
  const startFasting = (hours) => {
    const next = { isActive: true, startTime: new Date().toISOString(), durationHours: Number(hours) || 16 };
    setFastingState(next);
    // Firestore: persist fasting state
    if (user) saveSettings(user.uid, { routineSchedule, fastingState: next, anthropicKey });
  };

  // Action: Fasting timer stop
  const endFasting = () => {
    const next = { isActive: false, startTime: null, durationHours: 16 };
    setFastingState(next);
    // Firestore: persist fasting state
    if (user) saveSettings(user.uid, { routineSchedule, fastingState: next, anthropicKey });
  };

  // Action: Add meal item to Weekly Schedule template
  const addWeeklyDietMeal = (day, mealType, foodItem) => {
    setWeeklyDietSchedule(prev => {
      const dayData = prev[day] || { breakfast: [], lunch: [], dinner: [], snacks: [] };
      const list = dayData[mealType] || [];
      const item = {
        id: `weekly-item-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        name: foodItem.name,
        cal: Number(foodItem.cal) || Number(foodItem.baseCalories) || 0,
        protein: Number(foodItem.protein) || Number(foodItem.baseProtein) || 0,
        carbs: Number(foodItem.carbs) || Number(foodItem.baseCarbs) || 0,
        fat: Number(foodItem.fat) || Number(foodItem.baseFat) || 0
      };
      const next = { ...prev, [day]: { ...dayData, [mealType]: [...list, item] } };
      // Firestore: persist weekly schedule
      if (user) saveWeeklyDiet(user.uid, next);
      return next;
    });
  };

  // Action: Remove meal item from Weekly Schedule template
  const removeWeeklyDietMeal = (day, mealType, itemId) => {
    setWeeklyDietSchedule(prev => {
      const dayData = prev[day];
      if (!dayData) return prev;
      const updated = (dayData[mealType] || []).filter(i => i.id !== itemId);
      const next = { ...prev, [day]: { ...dayData, [mealType]: updated } };
      // Firestore: persist weekly schedule
      if (user) saveWeeklyDiet(user.uid, next);
      return next;
    });
  };

  // Action: Apply Weekly Schedule for a day to a specific Date Log
  const applyWeeklyDietToDate = (day, dateStr) => {
    const plannedDay = weeklyDietSchedule[day];
    if (!plannedDay) return;
    const dateKey = dateStr || new Date().toISOString().split("T")[0];
    
    setDietPlan(prev => {
      const dayData = prev[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [], waterIntake: 0 };
      
      const mapList = (list) => (list || []).map(item => ({
        id: `meal-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: item.name,
        cal: item.cal,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat
      }));

      const newDay = {
        ...dayData,
        breakfast: [...(dayData.breakfast || []), ...mapList(plannedDay.breakfast)],
        lunch: [...(dayData.lunch || []), ...mapList(plannedDay.lunch)],
        dinner: [...(dayData.dinner || []), ...mapList(plannedDay.dinner)],
        snacks: [...(dayData.snacks || []), ...mapList(plannedDay.snacks)]
      };
      // Firestore: persist updated day
      if (user) saveDietDay(user.uid, dateKey, newDay);
      return { ...prev, [dateKey]: newDay };
    });
  };

  // Action: Apply a program day to a specific Date Log in Daily Tracker
  const applyProgramDayToDate = (dayName, dateStr) => {
    const programDay = dietFlowDataset?.diet_program?.weekly_schedule?.[dayName];
    if (!programDay) return;
    const dateKey = dateStr || new Date().toISOString().split("T")[0];

    const parseMacroNum = (str) => {
      if (typeof str === "number") return str;
      if (!str) return 0;
      const val = parseFloat(String(str).replace(/[^\d.]/g, ""));
      return isNaN(val) ? 0 : val;
    };
    const mapMealTypeToSlot = (t) => {
      const lc = t.toLowerCase();
      if (lc.includes("breakfast")) return "breakfast";
      if (lc.includes("lunch")) return "lunch";
      if (lc.includes("dinner")) return "dinner";
      return "snacks";
    };
    const newItems = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    programDay.meals.forEach(meal => {
      newItems[mapMealTypeToSlot(meal.meal_type)].push({
        id: `prog-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: meal.item_name,
        cal: parseMacroNum(meal.macros.calories),
        protein: parseMacroNum(meal.macros.protein),
        carbs: parseMacroNum(meal.macros.carbs),
        fat: parseMacroNum(meal.macros.fat)
      });
    });

    setDietPlan(prev => {
      const dayData = prev[dateKey] || { breakfast: [], lunch: [], dinner: [], snacks: [], waterIntake: 0 };
      const newDay = {
        ...dayData,
        breakfast: [...(dayData.breakfast || []), ...newItems.breakfast],
        lunch: [...(dayData.lunch || []), ...newItems.lunch],
        dinner: [...(dayData.dinner || []), ...newItems.dinner],
        snacks: [...(dayData.snacks || []), ...newItems.snacks]
      };
      // Firestore: persist updated day
      if (user) saveDietDay(user.uid, dateKey, newDay);
      return { ...prev, [dateKey]: newDay };
    });
  };

  // Action: Apply a program day to a specific Weekday in Weekly Planner template
  const applyProgramDayToWeekly = (programDayName, weeklyDayName) => {
    const programDay = dietFlowDataset?.diet_program?.weekly_schedule?.[programDayName];
    if (!programDay) return;

    const parseMacroNum = (str) => {
      if (typeof str === "number") return str;
      if (!str) return 0;
      const val = parseFloat(String(str).replace(/[^\d.]/g, ""));
      return isNaN(val) ? 0 : val;
    };
    const mapMealTypeToSlot = (t) => {
      const lc = t.toLowerCase();
      if (lc.includes("breakfast")) return "breakfast";
      if (lc.includes("lunch")) return "lunch";
      if (lc.includes("dinner")) return "dinner";
      return "snacks";
    };
    const newItems = { breakfast: [], lunch: [], dinner: [], snacks: [] };
    programDay.meals.forEach(meal => {
      newItems[mapMealTypeToSlot(meal.meal_type)].push({
        id: `prog-week-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        name: meal.item_name,
        cal: parseMacroNum(meal.macros.calories),
        protein: parseMacroNum(meal.macros.protein),
        carbs: parseMacroNum(meal.macros.carbs),
        fat: parseMacroNum(meal.macros.fat)
      });
    });

    setWeeklyDietSchedule(prev => {
      const next = { ...prev, [weeklyDayName]: newItems };
      // Firestore: persist weekly schedule
      if (user) saveWeeklyDiet(user.uid, next);
      return next;
    });
  };

  // Action: Apply the entire program to Weekly Planner templates (Monday-Sunday)
  const applyEntireProgramToWeekly = () => {
    const parseMacroNum = (str) => {
      if (typeof str === "number") return str;
      if (!str) return 0;
      const val = parseFloat(String(str).replace(/[^\d.]/g, ""));
      return isNaN(val) ? 0 : val;
    };
    const mapMealTypeToSlot = (t) => {
      const lc = t.toLowerCase();
      if (lc.includes("breakfast")) return "breakfast";
      if (lc.includes("lunch")) return "lunch";
      if (lc.includes("dinner")) return "dinner";
      return "snacks";
    };

    setWeeklyDietSchedule(prev => {
      const newSchedule = { ...prev };
      Object.keys(dietFlowDataset?.diet_program?.weekly_schedule || {}).forEach(dayName => {
        const programDay = dietFlowDataset.diet_program.weekly_schedule[dayName];
        const newItems = { breakfast: [], lunch: [], dinner: [], snacks: [] };
        programDay.meals.forEach(meal => {
          newItems[mapMealTypeToSlot(meal.meal_type)].push({
            id: `prog-week-item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: meal.item_name,
            cal: parseMacroNum(meal.macros.calories),
            protein: parseMacroNum(meal.macros.protein),
            carbs: parseMacroNum(meal.macros.carbs),
            fat: parseMacroNum(meal.macros.fat)
          });
        });
        newSchedule[dayName] = newItems;
      });
      // Firestore: persist entire weekly schedule
      if (user) saveWeeklyDiet(user.uid, newSchedule);
      return newSchedule;
    });
  };

  return (
    <GymContext.Provider
      value={{
        profile,
        plans,
        history,
        measurements,
        personalRecords,
        chatHistory,
        anthropicKey,
        setAnthropicKey,
        updateProfile,
        logWorkout,
        savePlan,
        deletePlan,
        duplicatePlan,
        scheduleRoutine,
        logMeasurements,
        importPlan,
        addChatMessage,
        clearChatHistory,
        favorites,
        toggleFavorite,
        recentlyUsed,
        addRecentlyUsed,
        customGoals,
        addCustomGoal,
        deleteCustomGoal,
        updateGoalProgress,
        routineSchedule,
        fastingState,
        startFasting,
        endFasting,
        dietPlan,
        logMeal,
        deleteMealItem,
        logWater,
        indianRecipes,
        weeklyDietSchedule,
        addWeeklyDietMeal,
        removeWeeklyDietMeal,
        applyWeeklyDietToDate,
        dietProgram: dietFlowDataset?.diet_program,
        applyProgramDayToDate,
        applyProgramDayToWeekly,
        applyEntireProgramToWeekly
      }}
    >
      {children}
    </GymContext.Provider>
  );
};

