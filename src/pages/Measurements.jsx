import React, { useState } from "react";
import { useGym } from "../store/GymContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import MeasurementGauge from "../components/charts/MeasurementGauge";
import { formatWeight, formatLength } from "../utils/formatters";
import { Calendar, Plus, History, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";
import { motion } from "framer-motion";

export const Measurements = () => {
  const { measurements, profile, logMeasurements } = useGym();

  const weightUnit = profile?.unitPref?.weight || "kg";
  const lengthUnit = profile?.unitPref?.length || "cm";

  // Form states
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [chest, setChest] = useState("");
  const [waist, setWaist] = useState("");
  const [hips, setHips] = useState("");
  const [arms, setArms] = useState("");
  const [thighs, setThighs] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!weight) return;

    logMeasurements({
      weight: parseFloat(weight),
      bodyFat: bodyFat ? parseFloat(bodyFat) : null,
      chest: chest ? parseFloat(chest) : null,
      waist: waist ? parseFloat(waist) : null,
      hips: hips ? parseFloat(hips) : null,
      arms: arms ? parseFloat(arms) : null,
      thighs: thighs ? parseFloat(thighs) : null
    });

    // Reset form
    setWeight("");
    setBodyFat("");
    setChest("");
    setWaist("");
    setHips("");
    setArms("");
    setThighs("");
  };

  // Compare latest two entries
  const latest = measurements[0] || null;
  const previous = measurements[1] || null;

  const getDelta = (key) => {
    if (!latest || !previous || !latest[key] || !previous[key]) return null;
    const diff = latest[key] - previous[key];
    const rounded = Math.round(diff * 10) / 10;
    return {
      value: rounded,
      text: rounded > 0 ? `+${rounded}` : `${rounded}`,
      isDecrease: rounded < 0,
      isIncrease: rounded > 0
    };
  };

  // Weight Trend Sparkline Generator
  const renderSparkline = () => {
    if (measurements.length < 2) return <span className="text-[10px] text-gray-400 font-bold">STABLE</span>;
    
    // Sort chronologically (oldest first)
    const sorted = [...measurements].sort((a, b) => new Date(a.date) - new Date(b.date));
    const weights = sorted.map(m => m.weight);
    
    const minW = Math.min(...weights) - 0.5;
    const maxW = Math.max(...weights) + 0.5;
    const range = maxW - minW || 1;
    
    const width = 110;
    const height = 24;
    
    const points = weights.map((w, idx) => {
      const x = (idx / (weights.length - 1)) * width;
      const y = height - ((w - minW) / range) * height;
      return { x, y };
    });
    
    const pathData = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(" ");
    
    return (
      <div className="flex flex-col items-end gap-1 select-none">
        <svg width={width} height={height} className="overflow-visible">
          <path d={pathData} fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="3.5" fill="#FF6B00" stroke="#FFFFFF" strokeWidth="1.5" />
        </svg>
        <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Weight Sparkline</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Title */}
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Body Composition</span>
        <h2 className="font-heading text-4xl font-black text-charcoal leading-none uppercase">Measurements</h2>
      </div>

      {/* BMI visual gauge with orange needle */}
      <Card className="flex flex-col items-center justify-center p-5 border border-gray-100 shadow-sm relative overflow-hidden">
        <MeasurementGauge 
          weight={latest?.weight || profile?.weight || 75} 
          height={profile?.height || 180} 
        />
      </Card>

      {/* Weight trend sparkline and progress comparison */}
      {latest && (
        <Card tint={1} className="flex flex-col gap-4 p-5 shadow-sm border border-orange-accent/5">
          <div className="flex justify-between items-center border-b border-orange-accent/10 pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal">Weekly Progress comparison</span>
            {renderSparkline()}
          </div>
          
          {previous ? (
            <div className="grid grid-cols-2 gap-4">
              {/* Weight Comparison */}
              <div className="flex justify-between items-center bg-white/70 p-3 rounded-2xl border border-orange-accent/5 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Weight</span>
                  <span className="font-heading text-xl font-bold text-charcoal leading-none mt-0.5">
                    {formatWeight(latest.weight, weightUnit)}
                  </span>
                </div>
                {getDelta("weight") && (
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${
                    getDelta("weight").isDecrease ? "text-emerald-600" : "text-orange-accent"
                  }`}>
                    {getDelta("weight").isDecrease ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                    <span>{getDelta("weight").text}</span>
                  </div>
                )}
              </div>

              {/* Body Fat Comparison */}
              <div className="flex justify-between items-center bg-white/70 p-3 rounded-2xl border border-orange-accent/5 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-bold text-gray-400">Body Fat</span>
                  <span className="font-heading text-xl font-bold text-charcoal leading-none mt-0.5">
                    {latest.bodyFat ? `${latest.bodyFat}%` : "--"}
                  </span>
                </div>
                {getDelta("bodyFat") && (
                  <div className={`flex items-center gap-0.5 text-xs font-bold ${
                    getDelta("bodyFat").isDecrease ? "text-emerald-600" : "text-orange-accent"
                  }`}>
                    {getDelta("bodyFat").isDecrease ? <ArrowDownRight size={14} /> : <ArrowUpRight size={14} />}
                    <span>{getDelta("bodyFat").text}%</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-xs text-gray-400 italic font-medium">
              Log another measurement to view comparison deltas and trends.
            </div>
          )}
        </Card>
      )}

      {/* Input log form - dark glass inputs, orange labels */}
      <Card className="p-5 flex flex-col gap-4 shadow-sm border border-gray-100">
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Log Today's Stats</span>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label={`Weight *`}
              type="number"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="e.g. 79.5"
              addon={weightUnit}
              required
            />
            <Input
              label="Body Fat"
              type="number"
              step="0.1"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="e.g. 17.5"
              addon="%"
            />
            <Input
              label="Waist"
              type="number"
              step="0.1"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
              placeholder="e.g. 84.5"
              addon={lengthUnit}
            />
            <Input
              label="Chest"
              type="number"
              step="0.1"
              value={chest}
              onChange={(e) => setChest(e.target.value)}
              placeholder="e.g. 104"
              addon={lengthUnit}
            />
            <Input
              label="Hips"
              type="number"
              step="0.1"
              value={hips}
              onChange={(e) => setHips(e.target.value)}
              placeholder="e.g. 96"
              addon={lengthUnit}
            />
            <Input
              label="Biceps"
              type="number"
              step="0.1"
              value={arms}
              onChange={(e) => setArms(e.target.value)}
              placeholder="e.g. 38"
              addon={lengthUnit}
            />
            <div className="col-span-2">
              <Input
                label="Thighs"
                type="number"
                step="0.1"
                value={thighs}
                onChange={(e) => setThighs(e.target.value)}
                placeholder="e.g. 56"
                addon={lengthUnit}
              />
            </div>
          </div>

          <Button type="submit" variant="primary" fullWidth={true} className="mt-2 text-[10px] font-extrabold uppercase tracking-widest">
            <Plus size={14} />
            <span>Save Measurement</span>
          </Button>
        </form>
      </Card>

      {/* History timeline log */}
      <Card className="flex flex-col gap-4 p-5 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
          <History size={16} className="text-orange-accent" />
          <h3 className="font-heading text-2xl font-bold tracking-wider text-charcoal uppercase">Measurement Timeline</h3>
        </div>

        {/* Timeline container */}
        <div className="flex flex-col gap-6 pl-4 relative before:absolute before:left-1.75 before:top-2 before:bottom-2 before:w-0.5 before:bg-orange-accent/15 max-h-90 overflow-y-auto pr-1 no-scrollbar">
          {measurements.map((m, idx) => (
            <div key={idx} className="relative flex flex-col gap-2">
              {/* Bullet node dot */}
              <div className="absolute -left-3.5 top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-orange-accent flex items-center justify-center shadow-sm" />
              
              <div className="flex justify-between items-center font-bold">
                <span className="text-[10px] text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Calendar size={11} className="text-orange-accent" />
                  {m.date}
                </span>
                <span className="font-heading text-xl text-orange-accent leading-none">
                  {formatWeight(m.weight, weightUnit)}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                {m.bodyFat && (
                  <span className="truncate">Fat: <span className="text-charcoal font-black">{m.bodyFat}%</span></span>
                )}
                {m.waist && (
                  <span className="truncate">Waist: <span className="text-charcoal font-black">{formatLength(m.waist, lengthUnit)}</span></span>
                )}
                {m.chest && (
                  <span className="truncate">Chest: <span className="text-charcoal font-black">{formatLength(m.chest, lengthUnit)}</span></span>
                )}
                {m.arms && (
                  <span className="truncate">Arm: <span className="text-charcoal font-black">{formatLength(m.arms, lengthUnit)}</span></span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Measurements;
