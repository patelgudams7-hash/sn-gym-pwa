import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGym } from "../store/GymContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { 
  Plus, 
  Trash2, 
  Play, 
  Clock, 
  Dumbbell, 
  Sparkles,
  Zap,
  TrendingUp,
  Activity
} from "lucide-react";
import { motion } from "framer-motion";

export const Plans = () => {
  const { plans, deletePlan } = useGym();
  const navigate = useNavigate();

  // Tabs state: 'featured' vs 'my-plans'
  const [activeTab, setActiveTab] = useState("featured");

  // Separate featured default plans from custom plans
  // Default plans are: plan-push, plan-pull, plan-legs (and any default featured presets we can specify)
  const defaultPlanIds = ["plan-push", "plan-pull", "plan-legs"];
  
  const featuredPlans = plans.filter(p => defaultPlanIds.includes(p.id));
  const myPlans = plans.filter(p => !defaultPlanIds.includes(p.id));

  // Additional mock featured plans to satisfy: Push/Pull/Legs, Full Body, HIIT, Cardio Blast
  const extraFeatured = [
    {
      id: "feat-fullbody",
      name: "APEX Full Body",
      difficulty: "Advanced",
      duration: 55,
      category: "Full Body Conditioning",
      description: "High-intensity compound lift combos targeting every major muscle group for total metabolic fatigue.",
      exercises: [
        { name: "Barbell Full Squat", target: "quads" },
        { name: "Barbell Bench Press", target: "chest" },
        { name: "Pullups", target: "back" },
        { name: "Dumbbell Shoulder Press", target: "shoulders" }
      ]
    },
    {
      id: "feat-hiit",
      name: "HIIT Shredder",
      difficulty: "Intermediate",
      duration: 30,
      category: "HIIT/Fat Burn",
      description: "Fast-paced intervals designed to spike heart rate, accelerate fat loss, and build athletic endurance.",
      exercises: [
        { name: "One Arm Medicine Ball Slam", target: "full-body" },
        { name: "Navy Seal Burpee", target: "full-body" },
        { name: "Crunch (Abdominal)", target: "abs" }
      ]
    },
    {
      id: "feat-cardio",
      name: "Cardio Blast",
      difficulty: "Beginner",
      duration: 25,
      category: "Aerobic / Cardio",
      description: "Low-impact endurance work combined with core circuits to elevate stamina and burn clean calories.",
      exercises: [
        { name: "Navy Seal Burpee", target: "full-body" },
        { name: "Partner plank band row", target: "abs" }
      ]
    }
  ];

  // Combine real loaded featured plans with extra ones if they are not already in state
  const displayedFeatured = [...featuredPlans];
  extraFeatured.forEach(item => {
    if (!displayedFeatured.some(p => p.id === item.id)) {
      displayedFeatured.push(item);
    }
  });

  const getDisplayedPlans = () => {
    if (activeTab === "featured") return displayedFeatured;
    return myPlans;
  };

  const currentPlans = getDisplayedPlans();

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Select Routine</span>
        <h2 className="font-heading text-4xl font-black text-charcoal leading-none uppercase">Workout Plans</h2>
      </div>

      {/* Tabs Selector: Inactive=dark glass, Active=orange gradient */}
      <div className="flex bg-charcoal/90 p-1.5 rounded-full border border-white/10 select-none">
        <button
          onClick={() => setActiveTab("featured")}
          className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === "featured"
              ? "bg-linear-to-r from-orange-accent to-amber-500 text-white shadow-md"
              : "text-white/60 hover:text-white"
          }`}
        >
          Featured Plans
        </button>
        <button
          onClick={() => setActiveTab("my-plans")}
          className={`flex-1 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer ${
            activeTab === "my-plans"
              ? "bg-linear-to-r from-orange-accent to-amber-500 text-white shadow-md"
              : "text-white/60 hover:text-white"
          }`}
        >
          My Plans ({myPlans.length})
        </button>
      </div>

      {/* Plan Grid / List */}
      <div className="flex flex-col gap-5">
        {currentPlans.length === 0 ? (
          <Card className="py-16 text-center text-gray-400 flex flex-col items-center gap-3">
            <Sparkles size={36} className="text-orange-accent/40 animate-pulse" />
            <div className="flex flex-col gap-1">
              <span className="text-sm font-bold uppercase tracking-wider text-charcoal">No Custom Plans</span>
              <span className="text-xs text-gray-500">Tap the FAB below to build your first routine!</span>
            </div>
            <Button
              variant="secondary"
              onClick={() => navigate("/builder")}
              className="mt-2 text-[9px] font-bold uppercase tracking-wider"
            >
              Build Routine
            </Button>
          </Card>
        ) : (
          <div className="flex flex-col gap-5">
            {currentPlans.map((plan, idx) => {
              // Tall card structure, rotating tints, 3D hover
              return (
                <Card 
                  key={plan.id} 
                  tint={(idx % 5) + 1}
                  hover3d={true}
                  className="flex flex-col gap-4 p-6 border border-orange-accent/5 shadow-md justify-between min-h-55"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-orange-accent">
                          {plan.category || "General Routine"}
                        </span>
                        {/* Name in Bebas Neue, athletic feel */}
                        <h3 className="font-heading text-3xl font-extrabold text-charcoal tracking-wide uppercase leading-none mt-1">
                          {plan.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant={plan.difficulty}>
                          {plan.difficulty}
                        </Badge>

                        {/* Show delete for custom plans in 'my-plans' tab */}
                        {activeTab === "my-plans" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Delete the custom plan "${plan.name}"?`)) {
                                deletePlan(plan.id);
                              }
                            }}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full border border-red-150 transition-colors cursor-pointer"
                            title="Delete Routine"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      {plan.description || "Start this high-performance routine customized to push muscle growth and fat oxidation."}
                    </p>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between border-t border-orange-accent/10 pt-4 mt-2">
                    <div className="flex gap-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Clock size={13} className="text-orange-accent" />
                        {plan.duration} MINS
                      </span>
                      <span className="flex items-center gap-1">
                        <Dumbbell size={13} className="text-orange-accent" />
                        {plan.exercises.length} EXERCISES
                      </span>
                    </div>

                    <Button
                      variant="primary"
                      onClick={() => {
                        // If it's a mock plan that isn't saved in the plans database, let's inject it into context first or navigate
                        navigate(`/workout/active/${plan.id}`);
                      }}
                      className="py-2.5 px-4 font-bold text-[10px] uppercase tracking-wider shrink-0"
                    >
                      <Play size={10} className="fill-white" />
                      <span>Start</span>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Orange Gradient CREATE PLAN Pill Button (FAB) */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center z-35 pointer-events-none">
        <motion.button
          onClick={() => navigate("/builder")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="pointer-events-auto bg-linear-to-r from-orange-accent via-[#FF8533] to-orange-accent text-white shadow-[0_8px_30px_rgba(255,107,0,0.4)] hover:shadow-[0_12px_35px_rgba(255,107,0,0.6)] font-heading text-lg font-bold tracking-widest uppercase py-3.5 px-7 rounded-full flex items-center gap-2 border border-orange-400/20 cursor-pointer"
        >
          <Plus size={20} className="stroke-[2.5]" />
          <span>Create Plan</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Plans;
