import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGym } from "../store/GymContext";
import { useExercises } from "../hooks/useExercises";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Plus,
  Trash2,
  Share2,
  Upload,
  Search,
  Check,
  ChevronUp,
  ChevronDown
} from "lucide-react";
import { motion } from "framer-motion";

// Sortable Row Component
function SortableExerciseRow({
  id,
  exercise,
  onRemove,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 20 : 1
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl shadow-sm hover:border-orange-accent/25 transition-all text-charcoal"
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-gray-300 hover:text-orange-accent transition-colors shrink-0"
      >
        <GripVertical size={16} />
      </div>

      {/* Exercise Details */}
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-xs uppercase tracking-wide truncate">{exercise.name}</h4>
        <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{exercise.target} • {exercise.equipment}</span>
      </div>

      {/* Fallback accessibility buttons (Click to Sort) */}
      <div className="flex flex-col gap-0.5 sm:flex-row">
        <button
          type="button"
          disabled={isFirst}
          onClick={onMoveUp}
          className="p-1 hover:bg-gray-150 text-gray-400 disabled:opacity-30 rounded cursor-pointer"
        >
          <ChevronUp size={14} />
        </button>
        <button
          type="button"
          disabled={isLast}
          onClick={onMoveDown}
          className="p-1 hover:bg-gray-150 text-gray-400 disabled:opacity-30 rounded cursor-pointer"
        >
          <ChevronDown size={14} />
        </button>
      </div>

      {/* Remove Button */}
      <button
        type="button"
        onClick={onRemove}
        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-colors cursor-pointer border border-red-150 active:scale-90"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}

export const Builder = () => {
  const { savePlan, importPlan } = useGym();
  const { filterExercises } = useExercises();
  const navigate = useNavigate();

  // Builder States
  const [planName, setPlanName] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [duration, setDuration] = useState(45);
  const [description, setDescription] = useState("");
  const [selectedExercises, setSelectedExercises] = useState([]); // [{ tempId, id, name, target, equipment }]
  
  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  
  // Import/Export States
  const [importString, setImportString] = useState("");
  const [shareString, setShareString] = useState("");

  const searchResults = searchQuery ? filterExercises(searchQuery, "All", "All", "All") : [];

  // Setup sensors for DND kit
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Dnd Drag handler
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setSelectedExercises((items) => {
        const oldIndex = items.findIndex((item) => item.tempId === active.id);
        const newIndex = items.findIndex((item) => item.tempId === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Add exercise to plan
  const addExercise = (ex) => {
    const defaultEx = {
      tempId: `${ex.id}-${Date.now()}`,
      id: ex.id,
      name: ex.name,
      gifUrl: ex.gifUrl,
      target: ex.target,
      equipment: ex.equipment,
      instructions: ex.instructions || [],
      defaultSets: [
        { reps: 10, weight: 20, completed: false },
        { reps: 10, weight: 20, completed: false },
        { reps: 10, weight: 20, completed: false }
      ]
    };
    setSelectedExercises(prev => [...prev, defaultEx]);
  };

  const removeExercise = (tempId) => {
    setSelectedExercises(prev => prev.filter(e => e.tempId !== tempId));
  };

  // Manual sorting fallbacks
  const moveUp = (index) => {
    if (index === 0) return;
    setSelectedExercises(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  };

  const moveDown = (index) => {
    if (index === selectedExercises.length - 1) return;
    setSelectedExercises(prev => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!planName) return alert("Please specify a routine name.");
    if (selectedExercises.length === 0) return alert("Add at least one exercise.");

    const id = `plan-${Date.now()}`;
    const newPlan = {
      id,
      name: planName,
      difficulty,
      duration: Number(duration),
      description,
      category: selectedExercises[0]?.target || "Custom",
      exercises: selectedExercises.map(e => ({
        id: e.id,
        name: e.name,
        gifUrl: e.gifUrl,
        target: e.target,
        equipment: e.equipment,
        instructions: e.instructions,
        defaultSets: e.defaultSets
      }))
    };

    savePlan(newPlan);
    navigate("/plans");
  };

  // Export helper
  const handleExport = () => {
    const rawData = {
      name: planName || "Custom Workout",
      difficulty,
      duration,
      description,
      exercises: selectedExercises.map(e => ({
        id: e.id,
        name: e.name,
        gifUrl: e.gifUrl,
        target: e.target,
        equipment: e.equipment,
        instructions: e.instructions,
        defaultSets: e.defaultSets
      }))
    };
    setShareString(JSON.stringify(rawData, null, 2));
    setShowShareModal(true);
  };

  const handleImport = () => {
    if (!importString) return;
    const res = importPlan(importString);
    if (res.success) {
      alert("Plan imported successfully!");
      setImportString("");
      navigate("/plans");
    } else {
      alert(`Import failed: ${res.error}`);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Routine Creator</span>
        <h2 className="font-heading text-4xl font-black text-charcoal leading-none uppercase">Workout Builder</h2>
      </div>

      {/* Routine Setup Details */}
      <Card className="p-5 border border-gray-100 shadow-sm flex flex-col gap-4">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Routine Name *"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
            placeholder="e.g. Arms & Core Blast"
            required
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Difficulty Selector */}
            <div className="flex flex-col gap-1.5 w-full">
              <label className="text-[10px] font-bold uppercase text-orange-accent tracking-wider">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-charcoal/5 backdrop-blur-md border border-orange-accent/15 focus:border-orange-accent text-charcoal font-semibold text-xs py-3 px-3 rounded-xl outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            
            <Input
              label="Estimated Duration"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="e.g. 45"
              addon="min"
            />
          </div>

          <Input
            label="Short Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Targets biceps peak and lower core stability"
          />

          {/* Selected Exercises Queue */}
          <div className="flex flex-col gap-3.5 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                Exercises ({selectedExercises.length})
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowSearchModal(true)}
                className="py-1.5 px-3 font-bold text-[9px] uppercase tracking-wider bg-orange-accent/10 border border-orange-accent/20 hover:bg-orange-accent/15 text-orange-accent"
              >
                <Plus size={12} />
                <span>Add Lift</span>
              </Button>
            </div>

            {selectedExercises.length === 0 ? (
              <div className="text-center py-8 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 text-xs text-gray-400 font-bold uppercase tracking-wider">
                No exercises added yet.
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={selectedExercises.map(e => e.tempId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="flex flex-col gap-2.5">
                    {selectedExercises.map((ex, idx) => (
                      <SortableExerciseRow
                        key={ex.tempId}
                        id={ex.tempId}
                        exercise={ex}
                        onRemove={() => removeExercise(ex.tempId)}
                        onMoveUp={() => moveUp(idx)}
                        onMoveDown={() => moveDown(idx)}
                        isFirst={idx === 0}
                        isLast={idx === selectedExercises.length - 1}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>

          {/* Save & Export Actions */}
          <div className="flex gap-3 mt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={handleExport}
              disabled={selectedExercises.length === 0}
              className="py-3.5 flex-1 font-bold text-[10px] uppercase tracking-wider bg-white border border-gray-200 hover:bg-gray-50 text-charcoal shadow-sm"
            >
              <Share2 size={13} />
              <span>Export</span>
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              disabled={!planName || selectedExercises.length === 0}
              className="py-3.5 flex-2 font-bold text-[10px] uppercase tracking-wider"
            >
              <Check size={13} />
              <span>Save Routine</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* JSON Import Section */}
      <Card className="p-5 flex flex-col gap-3 border border-gray-100 shadow-sm">
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Import Routine String</span>
        <div className="flex flex-col gap-3">
          <textarea
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
            placeholder="Paste your JSON configuration block here..."
            className="w-full h-20 text-[10px] bg-charcoal/5 border border-orange-accent/15 focus:border-orange-accent rounded-xl p-3 outline-none resize-none font-mono text-charcoal"
          />
          <Button
            type="button"
            variant="ghost"
            fullWidth={true}
            onClick={handleImport}
            disabled={!importString}
            className="py-2.5 font-bold text-[10px] uppercase tracking-wider"
          >
            <Upload size={13} />
            <span>Load Plan from JSON</span>
          </Button>
        </div>
      </Card>

      {/* Add Exercises Modal (Search / Select) */}
      <Modal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        title="Search Exercises"
      >
        <div className="flex flex-col gap-4">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search exercise catalog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11"
            />
            <Search size={18} className="absolute left-4 top-3.75 text-orange-accent" />
          </div>

          <div className="flex flex-col gap-2.5 max-h-80 overflow-y-auto pr-1 no-scrollbar">
            {searchQuery === "" ? (
              <div className="text-center py-8 text-xs text-white/40 font-bold uppercase tracking-wider">
                Type an exercise name.
              </div>
            ) : searchResults.length === 0 ? (
              <div className="text-center py-8 text-xs text-white/40 font-bold uppercase tracking-wider">
                No matches found.
              </div>
            ) : (
              searchResults.slice(0, 25).map((ex) => (
                <div 
                  key={ex.id} 
                  className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/10 text-xs"
                >
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-white truncate uppercase tracking-wide">{ex.name}</span>
                    <span className="text-[9px] text-orange-accent font-bold uppercase tracking-wider">{ex.target}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      addExercise(ex);
                      // Visual feedback
                      alert(`Added "${ex.name}"!`);
                    }}
                    className="p-1.5 bg-orange-accent hover:bg-orange-600 text-white rounded-full transition-transform active:scale-90 cursor-pointer shadow-sm"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Modal>

      {/* Export / Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title="Export Routine"
      >
        <div className="flex flex-col gap-4 text-xs text-white">
          <p className="text-white/60 leading-relaxed font-semibold">
            Copy this configuration block. Paste it into the Import section on another device to load this plan!
          </p>
          <textarea
            readOnly
            value={shareString}
            onClick={(e) => e.target.select()}
            className="w-full h-32 bg-black/30 border border-white/10 rounded-xl p-3 outline-none resize-none font-mono text-[9px] select-all cursor-pointer text-orange-accent"
          />
          <Button
            variant="primary"
            fullWidth={true}
            onClick={() => {
              navigator.clipboard.writeText(shareString);
              alert("Configuration copied to clipboard!");
              setShowShareModal(false);
            }}
            className="py-3 font-bold text-[10px] uppercase tracking-wider"
          >
            <span>Copy Code Block</span>
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default Builder;
