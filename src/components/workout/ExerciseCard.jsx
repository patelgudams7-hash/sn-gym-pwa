import React from "react";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import { Plus, Trash2, ChevronRight, Dumbbell } from "lucide-react";

/**
 * Rebuilt Premium Exercise Card component supporting List and Grid layouts
 * @param {object} props
 * @param {object} props.exercise - Exercise data
 * @param {string} props.viewMode - 'list' or 'grid'
 * @param {number} props.tint - 1 to 5 for grid card gradient tints
 */
export const ExerciseCard = ({
  exercise,
  onClick,
  onAdd,
  onRemove,
  viewMode = "list",
  tint = 1,
  className = ""
}) => {
  const { name, target, bodyPart, equipment, gifUrl } = exercise;

  // GRID MODE RENDER
  if (viewMode === "grid") {
    return (
      <Card
        onClick={onClick}
        tint={tint}
        hover3d={true}
        className={`flex flex-col p-0 overflow-hidden border border-orange-accent/10 shadow-sm cursor-pointer ${className}`}
      >
        {/* GIF Thumbnail: Aspect 1:1, Cover, No Black Bars, Rounded top */}
        <div className="w-full aspect-square bg-white/40 overflow-hidden relative border-b border-orange-accent/5 shrink-0 flex items-center justify-center">
          {gifUrl ? (
            <img 
              src={gifUrl} 
              alt={name} 
              loading="lazy" 
              className="w-full h-full object-cover object-center" 
              onError={(e) => {
                e.target.style.display = "none";
                e.target.nextSibling.style.display = "flex";
              }}
            />
          ) : null}
          <div 
            style={{ display: gifUrl ? "none" : "flex" }} 
            className="w-full h-full flex flex-col items-center justify-center text-orange-accent bg-[#FFF5F0]/60 p-4 text-center gap-1.5"
          >
            <Dumbbell size={20} className="animate-pulse" />
            <span className="text-[8px] font-bold uppercase tracking-wider text-gray-400">APEX Demo</span>
          </div>
        </div>

        {/* Info panel */}
        <div className="p-3 flex flex-col justify-between flex-1 gap-2">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-xs text-charcoal line-clamp-2 leading-tight uppercase tracking-wide">
              {name}
            </h4>
          </div>
          
          <div className="flex flex-col gap-1.5 mt-auto pt-1">
            <Badge variant="orange" className="self-start text-[8px] px-2 py-0.5">
              {target || bodyPart}
            </Badge>
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide truncate">
              {equipment}
            </span>
          </div>
        </div>
      </Card>
    );
  }

  // LIST MODE RENDER (Compact row)
  return (
    <Card 
      onClick={onClick}
      hover3d={true}
      className={`flex items-center gap-4 py-3 px-4 bg-gray-50/50 border-gray-100 hover:border-orange-accent/25 transition-all cursor-pointer ${className}`}
    >
      {/* Small GIF Thumbnail */}
      <div className="w-12 h-12 rounded-xl border border-orange-accent/10 bg-white overflow-hidden shrink-0 flex items-center justify-center relative">
        {gifUrl ? (
          <img 
            src={gifUrl} 
            alt={name} 
            loading="lazy" 
            className="w-full h-full object-cover object-center" 
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
        ) : null}
        <div 
          style={{ display: gifUrl ? "none" : "flex" }} 
          className="w-full h-full flex items-center justify-center text-orange-accent bg-[#FFF5F0]"
        >
          <Dumbbell size={16} />
        </div>
      </div>

      {/* Info details */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <h4 className="font-bold text-xs text-charcoal truncate leading-snug uppercase tracking-wide">
          {name}
        </h4>
        <div className="flex items-center gap-2">
          <Badge variant="orange" className="px-1.5 py-0 text-[8px] uppercase tracking-wide">
            {target || bodyPart}
          </Badge>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide truncate">
            {equipment}
          </span>
        </div>
      </div>

      {/* Action triggers */}
      <div className="flex items-center gap-1">
        {onAdd && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAdd(exercise);
            }}
            className="p-1.5 bg-orange-accent hover:bg-orange-600 text-white rounded-full transition-all cursor-pointer shadow-sm active:scale-90"
          >
            <Plus size={14} />
          </button>
        )}
        
        {onRemove && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove(exercise.id);
            }}
            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-500 rounded-full transition-all cursor-pointer border border-red-150 active:scale-90"
          >
            <Trash2 size={14} />
          </button>
        )}

        {onClick && !onAdd && !onRemove && (
          <ChevronRight size={16} className="text-gray-300 shrink-0" />
        )}
      </div>
    </Card>
  );
};

export default ExerciseCard;
