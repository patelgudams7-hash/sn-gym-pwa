import React, { useState, useRef, useEffect } from "react";
import { useGym } from "../store/GymContext";
import Card from "../components/ui/Card";
import Modal from "../components/ui/Modal";
import { 
  Info, 
  Bot,
  Send,
  Utensils,
  ChevronRight
} from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const Diet = () => {
  const { dietProgram, anthropicKey, profile, measurements } = useGym();
  
  const currentWeight = measurements?.[0]?.weight || profile?.weight || 85;
  const targetWeight = profile?.targetWeight || 75;
  const startWeight = 85; // baseline start weight
  const weightProgressPct = startWeight === targetWeight ? 0 : Math.min(100, Math.max(0, Math.round(((startWeight - currentWeight) / (startWeight - targetWeight)) * 100)));
  const kgToGo = currentWeight - targetWeight;

  // Weekly active day selector
  const [selectedProgramDay, setSelectedProgramDay] = useState("Monday");
  const [selectedProgramMeal, setSelectedProgramMeal] = useState(null);
  const [cookingMethodTab, setCookingMethodTab] = useState("normal"); // normal | air_fryer
  
  // Horizontal pill switch state: "plan" | "coach"
  const [dietTab, setDietTab] = useState("plan");
  
  // Checkbox completion state
  const [completedMeals, setCompletedMeals] = useState(() => {
    try {
      const saved = localStorage.getItem("sn-gym-completed-meals");
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Failed to load completed meals:", e);
      return {};
    }
  });

  // Dynamic focus descriptions mapping for the welcome message
  const getWelcomeMessageForDay = (dayName) => {
    const focusTitles = {
      Monday: "Metabolic Priming & Clean Energy",
      Tuesday: "Fiber Optimization & Lipolysis",
      Wednesday: "Metabolic Flushing & High-Efficiency Protein",
      Thursday: "Thermogenic Activation & Recovery",
      Friday: "High-Protein Muscle Retention",
      Saturday: "Clean Carb Loading & GI Reset",
      Sunday: "Palate Saturation & Restructure"
    };

    const focusTexts = {
      Monday: "We are using specific ingredients like Warm Lemon Water and clean protein sources to set your metabolic baseline and prime your body for the week.",
      Tuesday: "We are using ingredients like Cumin-Chia Infusion and healthy fat sources to boost digestive efficiency and sustain fasted fat burning.",
      Wednesday: "We are using specific ingredients like Apple Cider Vinegar and Lemon to keep your insulin sensitivity sharp and your fat-burning engines hot!",
      Thursday: "We are using natural recovery minerals and targeted macros to support muscular repair and promote high BMR pathways.",
      Friday: "We are prioritizing clean amino profiles to defend lean muscle tissue while keeping fat mass reduction active.",
      Saturday: "We are utilizing complex, high-fiber carbohydrates and warm fluids to reset thyroid hormones and maintain thyroid output.",
      Sunday: "We are utilizing air-fried pepper chicken and low-calorie fiber plates to saturate the palate with premium tastes without heavy lipid storage."
    };

    const dayMeals = weeklySchedule[dayName]?.meals || [];
    
    const getMealEmoji = (type) => {
      const t = type.toLowerCase();
      if (t.includes("early morning")) return "ðŸŒ…";
      if (t.includes("breakfast")) return "ðŸ¥£";
      if (t.includes("tea")) return "ðŸµ";
      if (t.includes("mid-morning")) return "ðŸ¹";
      if (t.includes("lunch")) return "ðŸ›";
      if (t.includes("evening snack") || t.includes("snack")) return "ðŸ¥œ";
      if (t.includes("pre-workout") || t.includes("workout")) return "ðŸ¥¤";
      if (t.includes("dinner")) return "ðŸ—";
      return "ðŸ›";
    };

    const mealsFormatted = dayMeals.map(m => {
      const emoji = getMealEmoji(m.meal_type);
      return `### ${emoji} ${m.meal_type}
* **Meal:** **${m.item_name}**
* **Macros:** ${m.macros.calories} | P: ${m.macros.protein} | C: ${m.macros.carbs} | F: ${m.macros.fat}
* **ðŸ’¡ Shred Logic:** ${m.health_tip}`;
    }).join("\n\n");

    return `Hello! Happy ${dayName}! You are doing amazing. Today's focus is on **${focusTitles[dayName]}**. ${focusTexts[dayName]}\n\nHere is your **${dayName} Shred Schedule**:\n\n${mealsFormatted}`;
  };

  // Chat message state
  const [chatMessages, setChatMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("sn-gym-diet-chat-history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const chatEndRef = useRef(null);

  if (!dietProgram) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-sm font-semibold text-gray-500">Loading diet plan...</div>
      </div>
    );
  }

  const programName = "SN Gym Diet Plan";
  const target = dietProgram.target || "Weight Loss & Muscle Retention";
  const weeklySchedule = dietProgram.weekly_schedule || {};

  // Active day meals
  const dayMeals = weeklySchedule[selectedProgramDay]?.meals || [];

  // Parse numbers helper
  const parseMacroNum = (str) => {
    if (typeof str === "number") return str;
    if (!str) return 0;
    const cleanStr = String(str).replace(/[^\d.]/g, "");
    const val = parseFloat(cleanStr);
    return isNaN(val) ? 0 : val;
  };

  // Sync welcome message on weekday change
  useEffect(() => {
    setChatMessages(prev => {
      const welcomeMsg = {
        sender: "assistant",
        text: getWelcomeMessageForDay(selectedProgramDay),
        isWelcome: true
      };
      if (prev.length === 0) {
        return [welcomeMsg];
      }
      const updated = [...prev];
      updated[0] = welcomeMsg;
      return updated;
    });
  }, [selectedProgramDay]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, isTyping, dietTab]);

  // Toggle meal completion checkbox state
  const toggleMealComplete = (dayName, itemName) => {
    setCompletedMeals(prev => {
      const currentDayCompleted = prev[dayName] || [];
      let updated;
      if (currentDayCompleted.includes(itemName)) {
        updated = currentDayCompleted.filter(name => name !== itemName);
      } else {
        updated = [...currentDayCompleted, itemName];
      }
      
      const newCompleted = {
        ...prev,
        [dayName]: updated
      };
      
      try {
        localStorage.setItem("sn-gym-completed-meals", JSON.stringify(newCompleted));
      } catch (e) {
        console.error("Failed to save completed meals:", e);
      }
      
      return newCompleted;
    });
  };

  // Day total and progress calculations
  const activeDayCompleted = completedMeals[selectedProgramDay] || [];
  let totalCals = 0;
  let completedCals = 0;
  
  dayMeals.forEach(meal => {
    const mealCals = parseMacroNum(meal.macros.calories);
    totalCals += mealCals;
    if (activeDayCompleted.includes(meal.item_name)) {
      completedCals += mealCals;
    }
  });

  const completionPercent = totalCals > 0 
    ? Math.round((completedCals / totalCals) * 100) 
    : 0;

  // SVG circular properties for progress loader
  const radius = 26;
  const stroke = 3.5;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (completionPercent / 100) * circumference;

  // Custom inline markdown JSX parser/renderer
  const parseInlineBold = (str) => {
    const parts = str.split("**");
    return parts.map((part, index) => {
      if (index % 2 === 1) {
        return <strong key={index} className="text-charcoal font-black">{part}</strong>;
      }
      return part;
    });
  };

  const renderMessageText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-black text-xs uppercase tracking-wider text-charcoal mt-3 mb-1.5 flex items-center gap-1 select-none">
            {line.replace("### ", "")}
          </h4>
        );
      }
      
      if (line.startsWith("* ")) {
        const content = line.substring(2);
        return (
          <div key={idx} className="pl-3 py-0.5 text-[11px] text-charcoal/90 leading-relaxed font-semibold flex items-start gap-1.5">
            <span className="text-orange-accent shrink-0 select-none">â€¢</span>
            <span>{parseInlineBold(content)}</span>
          </div>
        );
      }

      return (
        <p key={idx} className="text-[11px] text-charcoal/90 font-semibold leading-relaxed mb-2.5">
          {parseInlineBold(line)}
        </p>
      );
    });
  };

  // Build grounded system prompt for the Diet AI Specialist chatbot
  const getDietSpecialistSystemPrompt = () => {
    const scheduleSummary = Object.keys(weeklySchedule).map(day => {
      const meals = weeklySchedule[day]?.meals || [];
      const mealsStr = meals.map(m => {
        const normalSteps = m.cooking_methods?.normal?.join(" ") || "";
        const airFryerSteps = m.cooking_methods?.air_fryer?.join(" ") || "";
        return `- [${m.meal_type}]: ${m.item_name} (Calories: ${m.macros.calories}, Protein: ${m.macros.protein}, Carbs: ${m.macros.carbs}, Fat: ${m.macros.fat})
  * Stovetop instructions: ${normalSteps}
  * Air fryer instructions: ${airFryerSteps}
  * Health Coach Tip: ${m.health_tip}`;
      }).join("\n");
      
      return `### Day: ${day}\n${mealsStr}`;
    }).join("\n\n");

    return `You are Gemini Diet AI Specialist, an elite personal nutritionist and diet coach inside the SN Gym app.
Your system profile:
- You have full, absolute knowledge of the user's finalized 1-Week diet program plan (SN Gym Diet Plan).
- Below is the full schedule, macros, and cooking steps for all meals from Monday to Sunday:
${scheduleSummary}

Instructions:
1. Always refer to yourself as the "Gemini Diet AI Specialist".
2. You have complete knowledge of the user's 1-week plan, including air fryer recipes and macros.
3. If the user asks about prep steps, grocery shopping list, swaps, or macros for any day (e.g. Wednesday air fryer chicken dinner steps), read from the schedule data above and give them the exact correct information.
4. Keep responses concise (under 200 words), motivating, and direct. Use bullet points for steps or grocery lists.
5. If the user asks general diet questions, relate it back to their active SN Gym Diet Plan when helpful.`;
  };

  // Grounded local simulator fallback when API key is missing or calls fail
  const generateLocalDietResponse = (query) => {
    const q = query.toLowerCase();
    
    // Check Wednesday's air fryer chicken steps
    if (q.includes("wednesday") && (q.includes("chicken") || q.includes("dinner") || q.includes("air fryer") || q.includes("steps"))) {
      const wedMeals = weeklySchedule["Wednesday"]?.meals || [];
      const chickenDinner = wedMeals.find(m => m.item_name.toLowerCase().includes("chicken") || m.meal_type.toLowerCase().includes("dinner"));
      
      if (chickenDinner) {
        const steps = chickenDinner.cooking_methods?.air_fryer?.map((s, i) => `${i + 1}. ${s}`).join("\n");
        return `Here are the steps for Wednesday's Air-Fried Garlic Pepper Chicken Breast dinner:\n\n${steps}\n\n💡 *Coach Tip:* ${chickenDinner.health_tip}`;
      }
    }
    
    // Check Sunday's grocery or general grocery list
    if (q.includes("grocery") || q.includes("shopping") || q.includes("list")) {
      const targetDay = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].find(d => q.includes(d));
      
      if (targetDay) {
        const dayKey = targetDay.charAt(0).toUpperCase() + targetDay.slice(1);
        const dayMeals = weeklySchedule[dayKey]?.meals || [];
        const items = dayMeals.map(m => `- ${m.item_name} (${m.meal_type})`).join("\n");
        return `Here is your grocery shopping list for ${dayKey}:\n\n${items}\n\nEat clean and stick to the targets!`;
      } else {
        const itemsList = [];
        Object.keys(weeklySchedule).forEach(day => {
          const meals = weeklySchedule[day]?.meals || [];
          meals.forEach(m => {
            if (!itemsList.includes(m.item_name)) {
              itemsList.push(m.item_name);
            }
          });
        });
        const fullList = itemsList.map(item => `- ${item}`).join("\n");
        return `Here is your full weekly grocery list for the SN Gym Diet Plan:\n\n${fullList}\n\nPrioritize lean protein sources and healthy fats!`;
      }
    }

    const dietGeneralPool = [
      "I am your Gemini Diet AI Specialist! Ask me any questions about your SN Gym Diet Plan schedule, recipe steps, macros, or grocery shopping lists.\n\nTry asking:\n- *'What are the steps for Wednesday's air fryer chicken dinner?'*\n- *'Give me a grocery shopping list for Sunday.'*",
      "Eating protein-rich, calorie-dense foods helps build muscle. What meal of the day would you like to review or swap? 🍳",
      "Consuming complex carbohydrates provides sustained energy for your lifting sessions. Ask me for grocery lists or specific macro counts of any meal! 🥑",
      "Clean hydration and whole foods are the key to health. Let me know if you want the air fryer preparation steps for any of your plan days! 🥗"
    ];
    
    return dietGeneralPool[Math.floor(Math.random() * dietGeneralPool.length)];
  };

  // Chat message sending logic
  const handleSendDietMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userText = chatInput.trim();
    setChatInput("");
    
    const updatedMessages = [...chatMessages, { sender: "user", text: userText }];
    setChatMessages(updatedMessages);
    localStorage.setItem("sn-gym-diet-chat-history", JSON.stringify(updatedMessages));
    
    setIsTyping(true);
    const systemPrompt = getDietSpecialistSystemPrompt();
    
    try {
      const rawKey = import.meta.env.VITE_GEMINI_API_KEY || "";
      const cleanKey = rawKey.replace(/\.+$/, "");
      if (!cleanKey) {
        throw new Error("No Gemini API Key provided");
      }

      const genAI = new GoogleGenerativeAI(cleanKey);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: systemPrompt
      });

      const history = chatMessages && chatMessages.length > 0
        ? chatMessages.map(msg => ({
            role: msg.sender === "assistant" || msg.sender === "model" ? "model" : "user",
            parts: [{ text: msg.text || "" }]
          }))
        : [];

      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.8
        }
      });

      const result = await chat.sendMessage(userText);
      const replyText = await result.response.text();

      const finalMessages = [...updatedMessages, { sender: "assistant", text: replyText }];
      setChatMessages(finalMessages);
      localStorage.setItem("sn-gym-diet-chat-history", JSON.stringify(finalMessages));
    } catch (err) {
      console.error("AI Coach request error:", err);
      const localReply = generateLocalDietResponse(userText) + "\n\n*(Grounded local simulation)*";
      const finalMessages = [...updatedMessages, { sender: "assistant", text: localReply }];
      setChatMessages(finalMessages);
      localStorage.setItem("sn-gym-diet-chat-history", JSON.stringify(finalMessages));
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-charcoal font-sans pb-10">
      
      {/* Weekday Selector with Saturday VEG Badge */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
          const isSelected = selectedProgramDay === day;
          const isSaturday = day === "Saturday";
          return (
            <button
              key={day}
              onClick={() => setSelectedProgramDay(day)}
              className={`py-2 px-4 rounded-full shrink-0 text-xs font-bold border transition-all cursor-pointer flex items-center ${
                isSelected 
                  ? "bg-orange-accent border-orange-accent text-white shadow-md" 
                  : "bg-surface border-border-light text-charcoal hover:bg-gray-100"
              }`}
            >
              <span>{day.toUpperCase()}</span>
              {isSaturday && (
                <span className={`ml-1 text-[7px] font-black uppercase px-1 rounded-sm ${
                  isSelected ? "bg-white text-green-700 font-extrabold" : "bg-green-100 text-green-700"
                }`}>
                  VEG
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Horizontal pill switch: Diet Plan vs AI Coach */}
      <div className="flex bg-gray-100/80 p-1 w-full max-w-sm mx-auto border border-gray-200/50 rounded-full select-none -mt-1">
        <button
          onClick={() => setDietTab("plan")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            dietTab === "plan"
              ? "bg-white text-orange-accent shadow-xs border border-gray-150"
              : "text-gray-400 hover:text-charcoal"
          }`}
        >
          <Utensils size={14} /> Diet Plan
        </button>
        <button
          onClick={() => setDietTab("coach")}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
            dietTab === "coach"
              ? "bg-white text-orange-accent shadow-xs border border-gray-150"
              : "text-gray-400 hover:text-charcoal"
          }`}
        >
          <Bot size={14} /> AI Coach
        </button>
      </div>

      {/* 1. DIET PLAN VIEW */}
      {dietTab === "plan" && (
        <div className="flex flex-col gap-6">
          {/* Premium Program Header Box (Restored) */}
          <div className="bg-linear-to-r from-orange-accent to-amber-500 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
              <span className="bg-white/20 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border border-white/10 shrink-0">
                Premium Plan ⚡
              </span>
              <h2 className="text-xl font-black mt-2 leading-tight">{programName}</h2>
              <p className="text-xs text-white/80 font-bold mt-1">Target: {target}</p>
              <p className="text-[11px] text-white/70 leading-relaxed mt-2.5 max-w-sm font-semibold">
                Optimized high-protein fat incinerating protocol designed to hold lean mass while maximizing lipid metabolic pathways.
              </p>
            </div>
            <div className="absolute -right-5 -bottom-5 text-9xl opacity-10 select-none pointer-events-none">
              🔥
            </div>
          </div>

          {/* Weight Target Tracker Card */}
          <Card className="p-5 bg-white border border-gray-100 rounded-[28px] shadow-xs select-none">
            <h4 className="text-[10px] font-black text-orange-accent uppercase tracking-widest mb-3">Weight Target Tracker</h4>
            <div className="flex items-center justify-between">
              <div className="bg-surface rounded-2xl px-5 py-3 text-center shrink-0 min-w-25">
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Current</span>
                <span className="text-base font-black text-charcoal">{currentWeight} kg</span>
              </div>

              <div className="w-9 h-9 rounded-full bg-orange-accent/10 flex items-center justify-center text-orange-accent shrink-0">
                <ChevronRight size={18} strokeWidth={3} />
              </div>

              <div className="bg-surface rounded-2xl px-5 py-3 text-center shrink-0 min-w-25">
                <span className="text-[9px] text-gray-400 font-bold uppercase block">Target</span>
                <span className="text-base font-black text-charcoal">{targetWeight} kg</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-gray-150 h-2 rounded-full overflow-hidden mt-4 mb-2">
              <div 
                className="bg-linear-to-r from-orange-accent to-amber-500 h-full transition-all duration-500"
                style={{ width: `${weightProgressPct}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-[9px] font-bold text-gray-400">
              <span>{weightProgressPct}% complete</span>
              <span className="text-orange-accent uppercase tracking-widest">
                {kgToGo > 0 ? `${kgToGo.toFixed(1)} kg to go` : "Goal reached! 🎉"}
              </span>
            </div>
          </Card>

          <Card className="p-5 flex justify-between items-center bg-white border border-gray-100 rounded-[28px] shadow-xs select-none">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-black uppercase text-orange-accent tracking-widest">
                ⚡ {selectedProgramDay.toUpperCase()} PROGRESS
              </span>
              <h2 className="text-lg font-black text-charcoal">Daily Calorie Budget</h2>
              <p className="text-[10px] text-gray-400 font-bold">
                Completed meals are saved to your local session.
              </p>
            </div>
            
            {/* SVG Circular Loader */}
            <div className="relative flex items-center justify-center w-14 h-14 shrink-0 bg-orange-accent/5 rounded-full border border-orange-accent/10">
              <svg height={radius * 2} width={radius * 2} className="-rotate-90">
                <circle
                  stroke="rgba(255, 107, 0, 0.08)"
                  fill="transparent"
                  strokeWidth={stroke}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                />
                <circle
                  stroke="var(--orange-accent, #FF6B00)"
                  fill="transparent"
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset }}
                  r={normalizedRadius}
                  cx={radius}
                  cy={radius}
                  className="transition-all duration-500 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-charcoal">{completionPercent}%</span>
            </div>
          </Card>

          {/* Redesigned Meal List Cards matching the Mockup */}
          <div className="flex flex-col gap-4">
            <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
              Scheduled Meals ({dayMeals.length} items)
            </h3>
            
            {dayMeals.map((meal, index) => {
              const isCompleted = activeDayCompleted.includes(meal.item_name);
              const calsVal = parseMacroNum(meal.macros.calories);

              return (
                <Card 
                  key={index} 
                  className={`p-4 flex flex-col gap-3 rounded-[28px] border transition-all ${
                    isCompleted 
                      ? "bg-white border-orange-accent/30 shadow-sm opacity-95 scale-[0.99]" 
                      : "bg-white border-gray-100 shadow-xs hover:border-orange-accent/25 hover:shadow-sm"
                  }`}
                >
                  {/* Top Row: Meal Type + Checkbox */}
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-black uppercase text-orange-accent tracking-widest">
                      {meal.meal_type}
                    </span>
                    
                    {/* Circular Custom Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMealComplete(selectedProgramDay, meal.item_name);
                      }}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                        isCompleted 
                          ? "bg-orange-accent border-orange-accent text-white shadow-xs" 
                          : "bg-white border-gray-200 hover:border-orange-accent"
                      }`}
                    >
                      {isCompleted && (
                        <div className="w-2.5 h-2.5 bg-white rounded-full" />
                      )}
                    </button>
                  </div>

                  {/* Title Line */}
                  <h4 
                    onClick={() => {
                      setSelectedProgramMeal(meal);
                      setCookingMethodTab("normal");
                    }}
                    className="font-black text-sm text-charcoal -mt-1 cursor-pointer hover:text-orange-accent transition-colors leading-tight"
                  >
                    {meal.item_name}
                  </h4>

                  {/* Middle Row: Image and Macros Capsule */}
                  <div className="flex gap-3 items-center">
                    {/* Thumbnail Image */}
                    <div 
                      onClick={() => {
                        setSelectedProgramMeal(meal);
                        setCookingMethodTab("normal");
                      }}
                      className="w-14 h-14 rounded-2xl overflow-hidden shrink-0 border border-gray-100 bg-gray-50 cursor-pointer"
                    >
                      {meal.image_url ? (
                        <img 
                          src={meal.image_url} 
                          alt={meal.item_name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xl">
                          ðŸ›
                        </div>
                      )}
                    </div>

                    {/* Macro pill boxes inside a gray capsule container */}
                    <div className="flex-1 bg-gray-50/70 border border-gray-100 rounded-2xl py-2 px-4 flex justify-between items-center text-center">
                      <div>
                        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Cals</span>
                        <span className="text-[11px] font-black text-charcoal mt-0.5 block">{calsVal}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest block">Prot</span>
                        <span className="text-[11px] font-black text-orange-accent mt-0.5 block">{meal.macros.protein}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest block">Carb</span>
                        <span className="text-[11px] font-black text-amber-600 mt-0.5 block">{meal.macros.carbs}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest block">Fat</span>
                        <span className="text-[11px] font-black text-blue-500 mt-0.5 block">{meal.macros.fat}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. AI COACH VIEW */}
      {dietTab === "coach" && (
        <div className="flex flex-col gap-4">
          {/* Gemini Header Card */}
          <Card className="p-4 flex items-center gap-3 bg-white border border-orange-accent/15 rounded-[28px] shadow-xs select-none">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center shrink-0 text-orange-accent">
              <Bot size={22} className="animate-pulse" />
            </div>
            <div>
              <h3 className="text-xs font-black text-charcoal">Gemini Diet AI Specialist</h3>
              <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                Ask for replacements, meal timings, or custom prep tips.
              </p>
            </div>
          </Card>

          {/* Chat Messages Log */}
          <Card className="bg-white border border-gray-100 rounded-[28px] p-4 flex flex-col min-h-105 max-h-125 shadow-xs relative">
            <div className="flex-1 overflow-y-auto pr-1 no-scrollbar space-y-4 pb-16">
              {chatMessages.map((msg, index) => {
                const isUser = msg.sender === "user";
                return (
                  <div key={index} className={`flex gap-2.5 items-start ${isUser ? "flex-row-reverse" : ""}`}>
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-[10px] font-black text-white ${
                      isUser ? "bg-charcoal" : "bg-orange-accent"
                    }`}>
                      {isUser ? "ME" : "AI"}
                    </div>
                    
                    {/* Message Bubble */}
                    <div className={`rounded-3xl p-4 text-[11px] font-semibold leading-relaxed max-w-[85%] ${
                      isUser 
                        ? "bg-charcoal text-white rounded-tr-none shadow-xs" 
                        : "bg-gray-50 border border-gray-100 text-charcoal rounded-tl-none shadow-xs"
                    }`}>
                      {renderMessageText(msg.text)}
                    </div>
                  </div>
                );
              })}
              
              {isTyping && (
                <div className="flex gap-2.5 items-start">
                  <div className="w-8 h-8 rounded-full bg-orange-accent shrink-0 flex items-center justify-center text-[10px] font-black text-white">
                    AI
                  </div>
                  <div className="bg-gray-50 border border-gray-100 text-gray-400 rounded-3xl rounded-tl-none p-3.5 text-xs font-semibold animate-pulse shadow-xs">
                    Thinking of nutrition tips...
                  </div>
                </div>
              )}
              
              <div ref={chatEndRef} />
            </div>

            {/* Input area positioned absolutely at bottom of card */}
            <div className="absolute bottom-3 left-3 right-3 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSendDietMessage();
                }}
                placeholder="Type your diet question..."
                className="flex-1 bg-gray-50 border border-gray-255 focus:border-orange-accent rounded-2xl px-4 py-3 text-xs font-semibold outline-none text-charcoal"
              />
              <button
                onClick={handleSendDietMessage}
                className="w-10 h-10 rounded-2xl bg-orange-accent text-white flex items-center justify-center hover:bg-orange-600 transition-all shadow-sm shrink-0 cursor-pointer"
              >
                <Send size={16} />
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Light Theme Details Modal */}
      {selectedProgramMeal && (
        <Modal 
          isOpen={!!selectedProgramMeal} 
          onClose={() => setSelectedProgramMeal(null)}
          title="Recipe Details"
          theme="light"
        >
          <div className="flex flex-col gap-4 max-h-[75vh] overflow-y-auto no-scrollbar p-1 text-charcoal">
            
            {/* Header image and basic info */}
            <div className="relative h-44 rounded-2xl overflow-hidden shrink-0 bg-gray-900 border border-gray-150 select-none">
              {selectedProgramMeal.image_url ? (
                <img 
                  src={selectedProgramMeal.image_url} 
                  alt={selectedProgramMeal.item_name}
                  className="w-full h-full object-cover opacity-80"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl bg-orange-accent/5">
                  ðŸ²
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-black via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[9px] font-black uppercase tracking-wider text-orange-accent">{selectedProgramMeal.meal_type}</span>
                <h3 className="text-sm font-black mt-0.5 text-white truncate drop-shadow-md">
                  {selectedProgramMeal.item_name}
                </h3>
              </div>
            </div>

            {/* Macro details row */}
            <div className="grid grid-cols-4 gap-2 bg-gray-50 border border-gray-150 rounded-xl p-2.5 shrink-0 text-center text-charcoal">
              <div>
                <div className="text-[8px] font-bold text-gray-500 uppercase">Calories</div>
                <div className="text-xs font-black text-orange-accent mt-0.5">{selectedProgramMeal.macros.calories}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-gray-500 uppercase">Protein</div>
                <div className="text-xs font-black mt-0.5">{selectedProgramMeal.macros.protein}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-gray-500 uppercase">Carbs</div>
                <div className="text-xs font-black mt-0.5">{selectedProgramMeal.macros.carbs}</div>
              </div>
              <div>
                <div className="text-[8px] font-bold text-gray-500 uppercase">Fat</div>
                <div className="text-xs font-black mt-0.5">{selectedProgramMeal.macros.fat}</div>
              </div>
            </div>

            {/* Health Coach Tip */}
            {selectedProgramMeal.health_tip && (
              <div className="bg-orange-accent/5 border border-orange-accent/15 rounded-xl p-3 shrink-0">
                <h4 className="text-[9px] font-black uppercase tracking-widest text-orange-accent mb-1 flex items-center gap-1 select-none">
                  <Info size={12} /> Health Coach Tip
                </h4>
                <p className="text-[11px] text-charcoal/80 font-medium italic leading-relaxed">
                  "{selectedProgramMeal.health_tip}"
                </p>
              </div>
            )}

            {/* Cooking instructions tabs */}
            <div className="flex flex-col gap-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-accent">
                Preparation Instructions
              </h4>
              <div className="flex gap-2 border-b border-gray-150 pb-1 select-none">
                <button 
                  onClick={() => setCookingMethodTab("normal")} 
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded transition-all cursor-pointer ${cookingMethodTab === "normal" ? "bg-charcoal text-white shadow-sm" : "bg-gray-100 text-gray-500"}`}
                >
                  Stovetop / Normal
                </button>
                <button 
                  onClick={() => setCookingMethodTab("air_fryer")} 
                  className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded transition-all cursor-pointer ${cookingMethodTab === "air_fryer" ? "bg-charcoal text-white shadow-sm" : "bg-gray-100 text-gray-500"}`}
                >
                  Air Fryer ðŸ’¨
                </button>
              </div>
              <ul className="list-decimal pl-4 space-y-1 text-[11px] text-gray-600 leading-relaxed font-semibold max-h-36 overflow-y-auto no-scrollbar">
                {cookingMethodTab === "normal" 
                  ? selectedProgramMeal.cooking_methods?.normal?.map((step, idx) => <li key={idx}>{step}</li>)
                  : selectedProgramMeal.cooking_methods?.air_fryer?.map((step, idx) => <li key={idx}>{step}</li>)
                }
              </ul>
            </div>
            
          </div>
        </Modal>
      )}

    </div>
  );
};

export default Diet;

