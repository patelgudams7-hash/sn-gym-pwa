import React, { useState, useRef, useEffect } from "react";
import { Send, X, Trash2, Mic, Heart, Play } from "lucide-react";
import { useGym } from "../../store/GymContext";
import { useExercises } from "../../hooks/useExercises";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { askCoach } from "../../config/gemini";

// Custom Guru / Meditation SVG Icon (white, 32px)
const GuruIcon = ({ size = 32, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
    <circle cx="12" cy="11" r="9" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" opacity="0.6" />
    <circle cx="12" cy="6.5" r="2.5" fill="currentColor" />
    <path d="M12 9.5 C10 9.5, 9 11.5, 9 13.5 C9 15, 10.5 16, 12 16 C13.5 16, 15 15, 15 13.5 C15 11.5, 14 9.5, 12 9.5 Z" fill="currentColor" />
    <path d="M6 18.5 C7.5 17, 9 16.5, 10 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M18 18.5 C16.5 17, 15 16.5, 14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 19 C4 17.5, 8 16.5, 12 16.5 C16 16.5, 20 17.5, 20 19 C20 20.5, 17 21, 12 21 C7 21, 4 20.5, 4 19 Z" fill="currentColor" />
    <path d="M12 15 C10.5 15, 9.5 16.5, 12 18.5 C14.5 16.5, 13.5 15, 12 15 Z" fill="#FF9500" opacity="0.8" />
  </svg>
);

export const ApexCoach = () => {
  const { 
    favorites,
    toggleFavorite
  } = useGym();

  const { exercises } = useExercises();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem("sn-gym-coach-messages");
      return saved ? JSON.parse(saved) : [
        {
          role: "assistant",
          content: "Hello! I am Coach SN. Ask me anything about workouts or diet!",
          type: "general",
          exercises: [],
          meals: []
        }
      ];
    } catch (e) {
      return [
        {
          role: "assistant",
          content: "Hello! I am Coach SN. Ask me anything about workouts or diet!",
          type: "general",
          exercises: [],
          meals: []
        }
      ];
    }
  });

  const [chatHistory, setChatHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("sn-gym-coach-history");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("sn-gym-coach-messages", JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem("sn-gym-coach-history", JSON.stringify(chatHistory));
  }, [chatHistory]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, loading]);

  const quickPrompts = [
    "Belly fat",
    "Chest day",
    "15 min",
    "No equipment",
    "Beginner",
    "Surprise me"
  ];

  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    setLoading(true);
    setInputText("");
    
    const userMsg = { role: "user", content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    
    try {
      const response = await askCoach(trimmed, chatHistory);
      
      const coachMsg = {
        role: "model",
        content: response.message,
        exercises: response.exercises || [],
        meals: response.meals || [],
        type: response.type
      };
      
      setMessages(prev => [...prev, coachMsg]);
      setChatHistory(prev => [...prev, 
        userMsg, 
        { role: "model", content: response.message }
      ]);
      
    } catch (error) {
      console.error("Coach error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    const initial = [
      {
        role: "model",
        content: "Hello! I am Coach SN. Ask me anything about workouts or diet!",
        type: "general",
        exercises: [],
        meals: []
      }
    ];
    setMessages(initial);
    setChatHistory([]);
  };

  // Render message text with simple markdown formatting
  const renderMessageText = (text) => {
    if (!text) return null;
    return text.split("\n").map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-1" />;
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="font-sans font-extrabold text-sm text-[#1a1a1a] mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("* ")) {
        return (
          <div key={idx} className="flex items-start gap-1.5 text-xs text-gray-700 leading-relaxed mb-1">
            <span className="text-orange-accent mt-1">•</span>
            <span>{line.substring(2)}</span>
          </div>
        );
      }
      return (
        <p key={idx} className="text-xs text-gray-700 leading-relaxed mb-1 font-semibold">
          {line}
        </p>
      );
    });
  };

  return (
    <>
      {/* ── Floating FAB ── */}
      <div className="fixed bottom-24 right-5 z-40 flex items-center justify-center">
        {/* Pulsing ring animation */}
        <div 
          className="absolute -inset-1.5 rounded-full bg-[rgba(255,107,0,0.3)] animate-ping"
          style={{ animationDuration: "2s" }}
        />
        <motion.button
          onClick={() => setIsOpen(true)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.93 }}
          className="w-15 h-15 rounded-full bg-linear-to-r from-orange-accent to-[#FF9500] text-white flex items-center justify-center shadow-[0_8px_24px_rgba(255,107,0,0.4)] cursor-pointer z-10"
          aria-label="Open AI Coach"
        >
          <GuruIcon size={32} />
        </motion.button>
      </div>

      {/* ── Chat Pop-up ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center pointer-events-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-[#1a1a1a] pointer-events-auto"
            />

            {/* Chat Window */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 30 }}
              className="relative w-full max-w-md rounded-t-4xl shadow-[0_-12px_40px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col pointer-events-auto z-10 border-t border-x border-white/45"
              style={{
                height: "82%",
                background: "rgba(255, 255, 255, 0.45)",
                backdropFilter: "blur(30px) saturate(180%)",
                WebkitBackdropFilter: "blur(30px) saturate(180%)"
              }}
            >
              {/* Rainbow animated gradient border top */}
              <div 
                className="h-0.75 w-full"
                style={{
                  background: "linear-gradient(90deg, #FF6B00, #FFB87F, #22C55E, #00D2FF, #FF6B00)",
                  backgroundSize: "200% 100%",
                  animation: "rainbow-glow 4s linear infinite"
                }}
              />

              {/* Coach Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/40 bg-white/20 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-r from-orange-accent to-[#FF9500] flex items-center justify-center text-white shadow-xs">
                    <GuruIcon size={24} />
                  </div>
                  <div>
                    <h3 className="font-sans font-bold text-sm text-[#1a1a1a]">Coach SN</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="w-2 h-2 rounded-full bg-success-green" />
                      <span className="text-[10px] text-gray-500 font-bold">Online</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearChat}
                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 transition-transform cursor-pointer"
                    title="Clear Chat"
                  >
                    <Trash2 size={15} />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-gray-100 active:scale-90 transition-transform cursor-pointer"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 no-scrollbar">
                {(messages || []).map((msg, index) => {
                  const isUser = msg.role === "user";

                  return (
                    <div key={index} className="flex flex-col gap-2">
                      <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[80%] rounded-[20px] px-4 py-3 shadow-[0_2px_8px_rgba(255,107,0,0.04)] text-xs leading-relaxed ${
                            isUser 
                              ? "bg-linear-to-r from-orange-accent to-[#FF9500] text-white rounded-tr-xs"
                              : "bg-[#FFF0E5] border border-orange-accent/10 text-charcoal rounded-tl-xs"
                          }`}
                        >
                          {isUser ? <p className="font-medium">{msg.content}</p> : renderMessageText(msg.content)}
                        </div>
                      </div>

                      {/* Gemini Suggested Exercise Cards */}
                      {!isUser && msg.exercises && msg.exercises.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1 self-start w-[85%]">
                          <span className="text-[8px] font-bold text-orange-accent uppercase tracking-widest pl-2">Suggested Exercises:</span>
                          {msg.exercises.map((ex, exIdx) => {
                            // Find exercise details in database if possible to show info/gif
                            const dbEx = exercises?.find(e => e.name.toLowerCase() === ex.name.toLowerCase());
                            return (
                              <div key={exIdx} className="bg-white/75 backdrop-blur-md border border-orange-accent/10 rounded-2xl p-3 flex gap-3 shadow-xs">
                                <div className="w-11 h-11 rounded-xl bg-orange-accent/10 flex items-center justify-center shrink-0 text-orange-accent text-lg">
                                  🏋️
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                  <h5 className="font-black text-xs text-[#1a1a1a] truncate">{ex.name}</h5>
                                  <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                                    {ex.sets} sets x {ex.reps}
                                  </p>
                                </div>
                                <button
                                  onClick={() => {
                                    setIsOpen(false);
                                    navigate(`/workout/active/plan-push`);
                                  }}
                                  className="self-center bg-orange-accent text-white rounded-full p-1.5 active:scale-90 transition-transform"
                                >
                                  <Play size={10} fill="currentColor" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Gemini Suggested Diet Cards */}
                      {!isUser && msg.meals && msg.meals.length > 0 && (
                        <div className="flex flex-col gap-2 mt-1 self-start w-[85%]">
                          <span className="text-[8px] font-bold text-orange-accent uppercase tracking-widest pl-2">Suggested Diet Option:</span>
                          {msg.meals.map((meal, mealIdx) => (
                            <div key={mealIdx} className="bg-white/75 backdrop-blur-md border border-orange-accent/10 rounded-2xl p-3 flex gap-3 shadow-xs">
                              <div className="w-11 h-11 rounded-xl bg-orange-accent/10 flex items-center justify-center shrink-0 text-orange-accent text-lg">
                                🥣
                              </div>
                              <div className="flex-1 min-w-0 flex flex-col justify-center">
                                <h5 className="font-black text-xs text-[#1a1a1a] truncate">{meal.name}</h5>
                                <p className="text-[10px] text-gray-500 font-bold mt-0.5">
                                  {meal.calories} • Protein: {meal.protein}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {loading && (
                  <div className="flex justify-start">
                    <div className="bg-[#FFF0E5] border border-orange-accent/10 rounded-[20px] rounded-tl-xs px-4 py-3 shadow-xs">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 150, 300].map(delay => (
                          <span
                            key={delay}
                            className="w-1.5 h-1.5 rounded-full bg-orange-accent/50 animate-bounce"
                            style={{ animationDelay: `${delay}ms` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Prompts Chips */}
              <div className="px-5 py-2 flex gap-2 overflow-x-auto no-scrollbar shrink-0 select-none bg-white/20 backdrop-blur-md border-t border-white/20">
                {quickPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(p)}
                    className="shrink-0 bg-white/50 hover:bg-white/85 border border-white/60 rounded-full py-1.5 px-3 text-[10px] font-bold text-gray-500 hover:text-[#1a1a1a] active:scale-95 transition-all cursor-pointer whitespace-nowrap"
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="px-5 pb-6 pt-2.5 shrink-0 bg-white/30 backdrop-blur-md border-t border-white/30">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(inputText); }}
                  className="flex items-center gap-2 bg-white/60 border border-white/60 rounded-full px-4 py-2.5 focus-within:border-orange-accent/60 focus-within:bg-white focus-within:shadow-[0_0_12px_rgba(255,107,0,0.08)] transition-all"
                >
                  <button type="button" className="text-gray-400 hover:text-gray-600 active:scale-90 transition-transform">
                    <Mic size={16} />
                  </button>
                  <input
                    type="text"
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Ask Coach SN..."
                    className="flex-1 bg-transparent border-none text-xs text-[#1a1a1a] placeholder-gray-400 outline-none font-sans font-medium"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim()}
                    className="w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-40"
                    style={{
                      background: "linear-gradient(135deg, #FF6B00, #FF9500)"
                    }}
                  >
                    <Send size={12} className="text-white" />
                  </button>
                </form>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApexCoach;
