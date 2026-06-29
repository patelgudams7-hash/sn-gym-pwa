import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGym } from "../store/GymContext";
import { useWorkout } from "../hooks/useWorkout";
import { useTimer } from "../hooks/useTimer";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import SetTracker from "../components/workout/SetTracker";
import RestTimer from "../components/workout/RestTimer";
import GifPlayer from "../components/workout/GifPlayer";
import { formatDuration, formatWeight } from "../utils/formatters";
import { 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  Clock, 
  Info,
  Trophy,
  History,
  AlertTriangle,
  Play,
  RotateCcw,
  Sparkles,
  Calculator,
  Compass,
  VolumeX,
  Music
} from "lucide-react";

export const ActiveWorkout = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const { plans, logWorkout, history, profile } = useGym();
  
  // Setup phase configuration states
  const [setupPhase, setSetupPhase] = useState(true);
  const [mood, setMood] = useState("Focused");
  const [sessionName, setSessionName] = useState("");
  
  const [isFinished, setIsFinished] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  
  // Workout modes
  const [supersetMode, setSupersetMode] = useState(false);
  const [dropSetMode, setDropSetMode] = useState(false);
  const [pyramidMode, setPyramidMode] = useState(false);

  // plate calculator states
  const [showPlateCalc, setShowPlateCalc] = useState(false);
  const [targetWeightCalc, setTargetWeightCalc] = useState("60");
  const [barWeight, setBarWeight] = useState("20");
  const [plateResult, setPlateResult] = useState("");

  // 1RM calculator states
  const [show1RMCalc, setShow1RMCalc] = useState(false);
  const [oneRmWeight, setOneRmWeight] = useState("80");
  const [oneRmReps, setOneRmReps] = useState("5");
  const [oneRmResult, setOneRmResult] = useState("");

  // Countdown timer trigger
  const [countdownNum, setCountdownNum] = useState(null);

  const plan = plans.find((p) => p.id === planId);
  const unitPref = profile?.unitPref?.weight || "kg";

  // Setup rest timer
  const restTimer = useTimer(() => {
    console.log("Rest completed!");
  });

  const triggerRestTimer = () => {
    restTimer.start(60);
  };

  // Setup workout state hook
  const workout = useWorkout(plan, triggerRestTimer);

  useEffect(() => {
    if (plan && !sessionName) {
      setSessionName(plan.name);
    }
  }, [plan]);

  if (!plan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#0A0A0A] p-5 text-center gap-4 text-white">
        <AlertTriangle size={48} className="text-red-500" />
        <h3 className="font-heading text-2xl uppercase tracking-wider">Plan Not Found</h3>
        <p className="text-xs text-white/50">The workout routine you are looking for does not exist.</p>
        <Button variant="primary" onClick={() => navigate("/plans")} className="text-xs font-bold uppercase tracking-wider">
          Back to Plans
        </Button>
      </div>
    );
  }

  const {
    workoutState,
    currentExercise,
    currentExerciseIndex,
    nextExercisePreview,
    elapsedSeconds,
    updateSet,
    addSet,
    removeSet,
    nextExercise,
    prevExercise,
    totalExercisesCount
  } = workout;

  // Handle final finish
  const handleFinish = () => {
    if (!workoutState) return;
    logWorkout({
      planId: plan.id,
      planName: sessionName || plan.name,
      durationSeconds: elapsedSeconds,
      mood: mood,
      exercises: workoutState.exercises
    });
    setIsFinished(true);
  };

  // Auto Name Generator
  const generateWorkoutName = () => {
    const prefixes = ["Iron", "Apex", "Shatter", "Decimation", "Titanium", "Power"];
    const cores = ["Vascular", "Hypertrophy", "Willpower", "Volume", "Squeezing", "Overload"];
    const suffixes = ["Protocol", "Obliteration", "Console", "Frenzy", "Session"];
    
    const p = prefixes[Math.floor(Math.random() * prefixes.length)];
    const c = cores[Math.floor(Math.random() * cores.length)];
    const s = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    setSessionName(`${p} ${c} ${s}`);
  };

  // Calculate live volume lifted in real-time
  const getLiveVolume = () => {
    if (!workoutState) return 0;
    let total = 0;
    workoutState.exercises.forEach(ex => {
      ex.sets.forEach(s => {
        if (s.completed) {
          total += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        }
      });
    });
    return total;
  };

  // Plates calculator helper
  const handleCalculatePlates = (e) => {
    e.preventDefault();
    const target = Number(targetWeightCalc) || 0;
    const bar = Number(barWeight) || 0;
    if (target <= bar) {
      setPlateResult("Target weight must be greater than bar weight.");
      return;
    }
    const weightPerSide = (target - bar) / 2;
    
    // Standard plates pool
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    let remainder = weightPerSide;
    const resultList = [];
    
    plates.forEach(p => {
      const count = Math.floor(remainder / p);
      if (count > 0) {
        resultList.push(`${count}x${p}kg`);
        remainder = remainder % p;
      }
    });

    if (resultList.length > 0) {
      setPlateResult(`Plates per side: ${resultList.join(", ")} (Est. leftover: ${remainder.toFixed(2)}kg)`);
    } else {
      setPlateResult("No standard plate match found.");
    }
  };

  // 1RM calculator helper
  const handleCalculate1RM = (e) => {
    e.preventDefault();
    const w = Number(oneRmWeight) || 0;
    const r = Number(oneRmReps) || 0;
    if (w <= 0 || r <= 0) return;
    
    // Epley formula
    const oneRM = w * (1 + r / 30);
    setOneRmResult(`Estimated 1RM: ${Math.round(oneRM)} ${unitPref}`);
  };

  // Custom set checking with 3..2..1 set countdown
  const handleCheckSet = (setIdx, isCompletedNow) => {
    if (isCompletedNow) {
      // Simulate a countdown
      setCountdownNum(3);
      const interval = setInterval(() => {
        setCountdownNum(prev => {
          if (prev === 1) {
            clearInterval(interval);
            setCountdownNum(null);
            updateSet(currentExerciseIndex, setIdx, { completed: true });
            triggerRestTimer();
            return null;
          }
          return prev - 1;
        });
      }, 500);
    } else {
      updateSet(currentExerciseIndex, setIdx, { completed: false });
    }
  };

  // Get previous log details
  const getPreviousLogs = () => {
    if (!currentExercise) return null;
    const match = history.find(h => h.exercises?.some(ex => ex.name === currentExercise.name));
    if (!match) return null;
    const exMatch = match.exercises.find(ex => ex.name === currentExercise.name);
    return {
      date: match.date,
      sets: exMatch.sets
    };
  };

  const previousLog = getPreviousLogs();

  const setsCount = currentExercise?.sets?.length || 0;
  const completedSetsCount = currentExercise?.sets?.filter(s => s.completed).length || 0;
  const setPercentage = setsCount > 0 ? Math.round((completedSetsCount / setsCount) * 100) : 0;

  // PHASE 1: SETUP PRE-START SCREEN
  if (setupPhase) {
    return (
      <div className="absolute inset-0 bg-[#0A0A0A] text-white flex flex-col justify-center items-center p-5 z-50 overflow-y-auto no-scrollbar">
        <Card darkGlass={true} className="w-full max-w-sm flex flex-col gap-6 p-6 border-orange-accent/20">
          <div className="text-center">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-accent">Console Initiation</span>
            <h2 className="font-heading text-3xl font-black text-white uppercase mt-1">Ready to Lift?</h2>
          </div>

          {/* Auto Routine Name Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-orange-accent">Workout Session Name</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Routines title..."
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-orange-accent text-white"
              />
              <button 
                type="button" 
                onClick={generateWorkoutName}
                className="px-3 bg-white/5 border border-white/10 hover:border-orange-accent rounded-xl text-xs"
                title="Generate premium name"
              >
                🎲
              </button>
            </div>
          </div>

          {/* Mood Selectors */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[9px] font-bold uppercase tracking-wider text-orange-accent">Current Energy Level</label>
            <div className="grid grid-cols-2 gap-2">
              {["Energized", "Focused", "Tired", "Stressed"].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMood(m)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    mood === m 
                      ? "bg-orange-accent border-orange-accent text-white shadow-md" 
                      : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          <Button 
            variant="primary" 
            fullWidth={true}
            onClick={() => setSetupPhase(false)}
            className="py-3.5 mt-2 font-bold uppercase tracking-widest text-xs"
          >
            Initiate Console ⚡
          </Button>
        </Card>
      </div>
    );
  }

  // PHASE 3: CONGRATULATIONS SUMMARY VIEW
  if (isFinished) {
    const minutes = Math.round(elapsedSeconds / 60);
    const calories = Math.round(minutes * 9.5);

    return (
      <div className="absolute inset-0 bg-[#0A0A0A] text-white flex flex-col gap-6 py-8 px-5 overflow-y-auto no-scrollbar z-50 items-center justify-center">
        {/* Confetti Particle Burst Simulator */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-45">
          {Array.from({ length: 25 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-orange-accent w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${1.5 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>

        <div className="text-center flex flex-col gap-2 mt-4 items-center z-10">
          <div className="w-20 h-20 rounded-full bg-orange-accent/10 border border-orange-accent/20 flex items-center justify-center text-orange-accent shadow-[0_0_25px_rgba(255,107,0,0.3)] animate-pulse">
            <Trophy size={40} className="fill-orange-accent animate-bounce" />
          </div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-orange-accent mt-3">Workout Recorded</span>
          <h2 className="font-heading text-4xl font-extrabold text-white uppercase tracking-wider">APEX COMPLETED! 🏆</h2>
          <p className="text-xs text-white/50 italic max-w-xs px-4">
            "The pain you feel today will be the strength you feel tomorrow."
          </p>
        </div>

        <Card darkGlass={true} className="w-full max-w-sm flex flex-col gap-5 p-6 border-orange-accent/20 z-10">
          <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Session Summary</span>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold text-white/40">Total Time</span>
              <span className="font-heading text-2xl font-bold text-white leading-none">{formatDuration(elapsedSeconds)}</span>
            </div>
            
            <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-1">
              <span className="text-[9px] uppercase font-bold text-white/40">Energy Burn</span>
              <span className="font-heading text-2xl font-bold text-white leading-none">{calories} kcal</span>
            </div>
          </div>

          <div className="bg-white/5 p-4 rounded-2xl border border-white/5 flex flex-col gap-1 text-center">
            <span className="text-[9px] uppercase font-bold text-white/40">Total Weight Lifted</span>
            <span className="font-heading text-2xl font-bold text-white leading-none">{getLiveVolume()} {unitPref}</span>
          </div>

          <Button
            variant="primary"
            fullWidth={true}
            onClick={() => navigate("/")}
            className="mt-2 text-xs py-3.5 font-bold uppercase tracking-widest animate-pulse"
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-[#0A0A0A] text-white p-5 flex flex-col gap-5 overflow-y-auto no-scrollbar z-50">
      
      {/* Header controls: Exit & Timer */}
      <div className="flex justify-between items-center shrink-0">
        <button
          onClick={() => setShowExitConfirm(true)}
          className="flex items-center gap-1.5 text-xs font-bold text-white/50 hover:text-white cursor-pointer transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Exit Session</span>
        </button>

        {/* Live Timer */}
        <div className="flex items-center gap-1.5 bg-orange-accent/10 border border-orange-accent/20 py-1.5 px-3.5 rounded-full text-xs font-bold text-orange-accent shadow-[0_0_10px_rgba(255,107,0,0.15)]">
          <Clock size={14} className="animate-pulse" />
          <span>{formatDuration(elapsedSeconds)}</span>
        </div>
      </div>

      {/* Subpage utilities (Plate calculator & 1RM calculator triggers) */}
      <div className="flex gap-2 shrink-0 select-none">
        <button 
          onClick={() => setShowPlateCalc(true)}
          className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:border-orange-accent/40 cursor-pointer"
        >
          <Calculator size={12} /> Plate Calc
        </button>
        <button 
          onClick={() => setShow1RMCalc(true)}
          className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-[9px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 hover:border-orange-accent/40 cursor-pointer"
        >
          <Compass size={12} /> 1RM Estimate
        </button>
      </div>

      {/* Toggles for superset/dropset/pyramid modes */}
      <div className="flex gap-1.5 shrink-0 justify-around select-none">
        <button 
          onClick={() => setSupersetMode(!supersetMode)}
          className={`py-1 px-2.5 rounded-full text-[8px] font-bold uppercase border transition-all ${
            supersetMode ? "bg-orange-accent border-orange-accent text-white" : "bg-white/5 border-white/10 text-white/40"
          }`}
        >
          Superset
        </button>
        <button 
          onClick={() => setDropSetMode(!dropSetMode)}
          className={`py-1 px-2.5 rounded-full text-[8px] font-bold uppercase border transition-all ${
            dropSetMode ? "bg-orange-accent border-orange-accent text-white" : "bg-white/5 border-white/10 text-white/40"
          }`}
        >
          Drop Set
        </button>
        <button 
          onClick={() => setPyramidMode(!pyramidMode)}
          className={`py-1 px-2.5 rounded-full text-[8px] font-bold uppercase border transition-all ${
            pyramidMode ? "bg-orange-accent border-orange-accent text-white" : "bg-white/5 border-white/10 text-white/40"
          }`}
        >
          Pyramid
        </button>
      </div>

      {/* Countdown overlay indicator */}
      {countdownNum !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs">
          <span className="font-heading text-9xl font-black text-orange-accent animate-ping">
            {countdownNum}
          </span>
        </div>
      )}

      {currentExercise && (
        <div className="flex flex-col gap-5 flex-1 pb-4">
          
          {/* Progress bar: set tracker progress */}
          <div className="flex flex-col gap-1.5 shrink-0">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-wider text-white/50">
              <span>Set Progress ({completedSetsCount} / {setsCount})</span>
              <span>Exercise {currentExerciseIndex + 1} of {totalExercisesCount}</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-linear-to-r from-orange-accent to-amber-500 rounded-full transition-all duration-300 shadow-[0_0_8px_#FF6B00]"
                style={{ width: `${setPercentage}%` }}
              />
            </div>
          </div>

          {/* Live total volume lifted */}
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex justify-between shrink-0 bg-white/5 px-4 py-2.5 rounded-xl border border-white/5">
            <span>Session Lifted Volume</span>
            <span className="text-orange-accent">{getLiveVolume()} {unitPref}</span>
          </div>

          {/* Exercise Heading in Bebas Neue */}
          <div className="flex flex-col shrink-0">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-orange-accent">Active Lift</span>
            <h2 className="font-heading text-4xl font-extrabold text-white tracking-wide uppercase leading-none mt-1">
              {currentExercise.name}
            </h2>
          </div>

          {/* GIF Player with orange glow border shadow */}
          <div className="shrink-0 shadow-[0_0_20px_rgba(255,107,0,0.25)] border border-orange-accent/20 rounded-2xl overflow-hidden">
            <GifPlayer gifUrl={currentExercise.gifUrl} altName={currentExercise.name} />
          </div>

          {/* Sets Tracker Panel */}
          <Card darkGlass={true} className="p-5 border-white/5 shrink-0">
            <SetTracker
              sets={currentExercise.sets}
              onUpdateSet={(setIdx, fields) => {
                if (fields.completed !== undefined) {
                  handleCheckSet(setIdx, fields.completed);
                } else {
                  updateSet(currentExerciseIndex, setIdx, fields);
                }
              }}
              onAddSet={() => addSet(currentExerciseIndex)}
              onRemoveSet={(setIdx) => removeSet(currentExerciseIndex, setIdx)}
              unitPref={unitPref}
            />
          </Card>

          {/* Next Exercise Preview or Finish Session Button */}
          <div className="mt-2 shrink-0">
            {currentExerciseIndex < totalExercisesCount - 1 ? (
              <Button
                variant="primary"
                fullWidth={true}
                onClick={nextExercise}
                className="py-3.5 text-xs uppercase font-bold tracking-widest"
              >
                <span>Next Move</span>
                <ChevronRight size={16} />
              </Button>
            ) : (
              <Button
                variant="primary"
                fullWidth={true}
                onClick={handleFinish}
                className="py-4 text-xs uppercase font-bold tracking-widest bg-linear-to-r from-orange-accent via-amber-500 to-orange-accent shadow-[0_0_20px_rgba(255,107,0,0.3)]"
              >
                Finish Session 🏆
              </Button>
            )}
            
            {currentExerciseIndex > 0 && (
              <button
                onClick={prevExercise}
                className="w-full text-center text-xs font-bold text-white/40 hover:text-white mt-3 py-2 cursor-pointer"
              >
                Go Back to Previous Move
              </button>
            )}
          </div>

          {/* Previous Performance Panel */}
          {previousLog && (
            <Card darkGlass={true} className="flex items-start gap-3 bg-white/5 border border-white/10 p-4 text-xs shrink-0">
              <History size={16} className="text-orange-accent shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-bold text-white/40 uppercase text-[9px] tracking-wider">
                  Previous Logs ({previousLog.date})
                </span>
                <div className="flex flex-wrap gap-x-3 gap-y-1 font-bold text-white/70">
                  {previousLog.sets.map((s, idx) => (
                    <span key={idx} className="bg-white/5 py-0.5 px-1.5 rounded">
                      S{idx + 1}: <span className="text-orange-accent">{formatWeight(s.weight, unitPref)}</span> × {s.reps}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* Instructions Guide */}
          {currentExercise.instructions && currentExercise.instructions.length > 0 && (
            <Card darkGlass={true} className="p-4 flex flex-col gap-2 border-white/5 shrink-0">
              <button
                onClick={() => setShowInstructions(!showInstructions)}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-wider text-white/50 cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Info size={14} className="text-orange-accent" />
                  <span>How to Execute</span>
                </span>
                <span>{showInstructions ? "Hide" : "Show"}</span>
              </button>
              
              {showInstructions && (
                <ol className="flex flex-col gap-2.5 text-xs text-white/80 mt-2 border-t border-white/10 pt-3">
                  {currentExercise.instructions.map((step, idx) => (
                    <li key={idx} className="flex gap-2 items-start">
                      <span className="font-heading text-orange-accent font-bold w-4">{idx + 1}.</span>
                      <p className="flex-1">{step}</p>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
          )}

        </div>
      )}

      {/* Floating Circular SVG Rest Timer Overlay */}
      {restTimer.isActive && (
        <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-5 pointer-events-none">
          <div className="pointer-events-auto">
            <RestTimer 
              secondsLeft={restTimer.secondsLeft}
              totalSeconds={60}
              onClose={restTimer.stop}
            />
          </div>
        </div>
      )}

      {/* exit confirmation modal */}
      {showExitConfirm && (
        <Modal 
          isOpen={showExitConfirm}
          onClose={() => setShowExitConfirm(false)}
          title="Exit Session?"
        >
          <div className="flex flex-col gap-4 text-white">
            <p className="text-xs text-white/70 leading-relaxed">
              Exiting will cancel this workout session entirely. Your logged progress so far will not be saved. Are you sure you want to stop?
            </p>
            <div className="flex gap-3 mt-2 shrink-0">
              <Button 
                onClick={() => {
                  setShowExitConfirm(false);
                  navigate("/plans");
                }}
                variant="danger" 
                fullWidth={true}
              >
                Yes, Stop Workout
              </Button>
              <Button 
                onClick={() => setShowExitConfirm(false)}
                variant="primary" 
                fullWidth={true}
              >
                Continue Workout
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* PLATE CALCULATOR MODAL */}
      {showPlateCalc && (
        <Modal 
          isOpen={showPlateCalc}
          onClose={() => {
            setShowPlateCalc(false);
            setPlateResult("");
          }}
          title="Barbell Plate Calculator"
        >
          <form onSubmit={handleCalculatePlates} className="flex flex-col gap-4 text-white">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div>
                <label className="text-[9px] font-bold text-orange-accent uppercase tracking-wider block mb-1">Target weight (kg)</label>
                <input 
                  type="number"
                  value={targetWeightCalc}
                  onChange={(e) => setTargetWeightCalc(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs outline-none text-white text-center font-bold"
                />
              </div>
              
              <div>
                <label className="text-[9px] font-bold text-orange-accent uppercase tracking-wider block mb-1">Bar weight (kg)</label>
                <select 
                  value={barWeight}
                  onChange={(e) => setBarWeight(e.target.value)}
                  className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-2.5 px-3 text-xs outline-none text-white font-bold"
                >
                  <option value="20">20 kg (Standard Olympic)</option>
                  <option value="15">15 kg (Women's Olympic)</option>
                  <option value="10">10 kg (Technique Bar)</option>
                </select>
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth={true}>Calculate Plates</Button>
            
            {plateResult && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center text-xs font-bold text-orange-accent">
                {plateResult}
              </div>
            )}
          </form>
        </Modal>
      )}

      {/* 1RM CALCULATOR MODAL */}
      {show1RMCalc && (
        <Modal 
          isOpen={show1RMCalc}
          onClose={() => {
            setShow1RMCalc(false);
            setOneRmResult("");
          }}
          title="Estimated 1RM Calculator"
        >
          <form onSubmit={handleCalculate1RM} className="flex flex-col gap-4 text-white">
            <div className="grid grid-cols-2 gap-3 shrink-0">
              <div>
                <label className="text-[9px] font-bold text-orange-accent uppercase tracking-wider block mb-1">Weight lifted ({unitPref})</label>
                <input 
                  type="number"
                  value={oneRmWeight}
                  onChange={(e) => setOneRmWeight(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs outline-none text-white text-center font-bold"
                />
              </div>
              <div>
                <label className="text-[9px] font-bold text-orange-accent uppercase tracking-wider block mb-1">Repetitions done</label>
                <input 
                  type="number"
                  value={oneRmReps}
                  onChange={(e) => setOneRmReps(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-xs outline-none text-white text-center font-bold"
                />
              </div>
            </div>

            <Button type="submit" variant="primary" fullWidth={true}>Calculate 1RM</Button>

            {oneRmResult && (
              <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-center text-xs font-black text-orange-accent">
                {oneRmResult}
              </div>
            )}
          </form>
        </Modal>
      )}

    </div>
  );
};

export default ActiveWorkout;
