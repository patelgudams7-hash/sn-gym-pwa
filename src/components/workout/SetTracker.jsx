import React from "react";
import { Plus, Minus, Check, Trash2 } from "lucide-react";
import Button from "../ui/Button";

export const SetTracker = ({
  sets,
  onUpdateSet,
  onAddSet,
  onRemoveSet,
  unitPref = "kg"
}) => {
  return (
    <div className="flex flex-col gap-3.5 text-white">
      {/* Table Header */}
      <div className="grid grid-cols-12 text-center text-[10px] font-bold uppercase tracking-wider text-white/50 pb-2 border-b border-white/10">
        <span className="col-span-2 text-left">Set</span>
        <span className="col-span-4">Weight ({unitPref})</span>
        <span className="col-span-3">Reps</span>
        <span className="col-span-3 text-right pr-2">Done</span>
      </div>

      {/* Set Rows */}
      <div className="flex flex-col gap-3">
        {sets.map((set, idx) => (
          <div 
            key={idx}
            className={`grid grid-cols-12 items-center text-center py-1 transition-all duration-300 ${
              set.completed ? "opacity-40" : ""
            }`}
          >
            {/* Set Index / Delete */}
            <div className="col-span-2 text-left flex items-center gap-1.5">
              <span className="font-sans font-bold text-sm text-white w-5">
                {idx + 1}
              </span>
              {sets.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveSet(idx)}
                  className="p-1 hover:text-red-500 text-white/30 rounded transition-colors cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>

            {/* Weight Controls */}
            <div className="col-span-4 flex items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={set.completed || set.weight <= 0}
                onClick={() => onUpdateSet(idx, { weight: Math.max(0, Number(set.weight) - 2.5) })}
                className="w-7 h-7 rounded-full border border-orange-accent/30 flex items-center justify-center text-orange-accent hover:bg-orange-accent/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <Minus size={12} />
              </button>
              
              <input
                type="number"
                disabled={set.completed}
                value={set.weight}
                onChange={(e) => onUpdateSet(idx, { weight: parseFloat(e.target.value) || 0 })}
                className="w-12 text-center text-sm font-bold text-white bg-transparent border-b border-dashed border-orange-accent/40 focus:border-orange-accent outline-none"
              />

              <button
                type="button"
                disabled={set.completed}
                onClick={() => onUpdateSet(idx, { weight: Number(set.weight) + 2.5 })}
                className="w-7 h-7 rounded-full border border-orange-accent/30 flex items-center justify-center text-orange-accent hover:bg-orange-accent/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Reps Controls */}
            <div className="col-span-3 flex items-center justify-center gap-1.5">
              <button
                type="button"
                disabled={set.completed || set.reps <= 0}
                onClick={() => onUpdateSet(idx, { reps: Math.max(0, set.reps - 1) })}
                className="w-7 h-7 rounded-full border border-orange-accent/30 flex items-center justify-center text-orange-accent hover:bg-orange-accent/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <Minus size={12} />
              </button>

              <span className="w-6 text-sm font-bold text-white">
                {set.reps}
              </span>

              <button
                type="button"
                disabled={set.completed}
                onClick={() => onUpdateSet(idx, { reps: set.reps + 1 })}
                className="w-7 h-7 rounded-full border border-orange-accent/30 flex items-center justify-center text-orange-accent hover:bg-orange-accent/10 active:scale-90 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <Plus size={12} />
              </button>
            </div>

            {/* Complete Checkbox */}
            <div className="col-span-3 flex justify-end items-center pr-2">
              <button
                type="button"
                onClick={() => onUpdateSet(idx, { completed: !set.completed })}
                className={`w-7 h-7 rounded-full flex items-center justify-center border transition-all duration-300 cursor-pointer ${
                  set.completed
                    ? "bg-linear-to-r from-orange-accent to-amber-500 text-white border-transparent shadow-[0_2px_8px_rgba(255,107,0,0.3)]"
                    : "border-orange-accent/40 hover:border-orange-accent bg-transparent text-transparent"
                }`}
              >
                <Check size={14} className="stroke-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Set Row Button */}
      <button
        type="button"
        onClick={onAddSet}
        className="mt-2.5 py-3 hover:bg-white/5 border border-dashed border-orange-accent/30 text-orange-accent font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
      >
        <Plus size={14} />
        <span>Add Set</span>
      </button>
    </div>
  );
};

export default SetTracker;
