import React, { useState, useEffect } from "react";
import { useGym } from "../store/GymContext";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { Trophy, Calendar, Sparkles, TrendingUp, ChevronDown } from "lucide-react";
import { formatWeight } from "../utils/formatters";
import { calculateBMI } from "../utils/bmi";
import { motion } from "framer-motion";

// Custom animated counter component
const AnimatedCounter = ({ value, duration = 800, decimal = false }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    const endVal = parseFloat(value) || 0;
    if (endVal === 0) {
      setCount(0);
      return;
    }

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const currentVal = progress * endVal;
      setCount(decimal ? Math.round(currentVal * 10) / 10 : Math.round(currentVal));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration, decimal]);

  return <span>{count}</span>;
};

export const Progress = () => {
  const { history, personalRecords, measurements, profile } = useGym();
  const unitPref = profile?.unitPref?.weight || "kg";
  
  const latestMeasure = measurements[0] || null;
  const bmiResults = latestMeasure
    ? calculateBMI(latestMeasure.weight, profile?.height || 180)
    : null;

  // Custom SVG Weekly Bar Chart Data Calculation
  const getWeeklyData = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const today = new Date();
    
    // Last 7 days
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      return {
        dateStr: d.toISOString().split("T")[0],
        dayName: days[d.getDay()],
        count: 0
      };
    });

    history.forEach((h) => {
      const matchingDay = last7Days.find(day => day.dateStr === h.date);
      if (matchingDay) {
        matchingDay.count += 1;
      }
    });

    return last7Days;
  };

  const weeklyData = getWeeklyData();
  const maxWeeklyCount = Math.max(...weeklyData.map(d => d.count), 1);

  // Custom SVG Monthly Line Chart Data Calculation (group last 30 days into 6 points of 5 days)
  const getMonthlyPoints = () => {
    const points = [];
    const today = new Date();
    
    // Initialize 6 points representing 5-day ranges
    for (let i = 5; i >= 0; i--) {
      const start = new Date(today);
      start.setDate(today.getDate() - (i * 5 + 4));
      const end = new Date(today);
      end.setDate(today.getDate() - (i * 5));
      
      const label = `${start.getDate()} - ${end.getDate()} ${end.toLocaleDateString("en-US", { month: "short" })}`;
      
      let caloriesSum = 0;
      history.forEach(h => {
        const logDate = new Date(h.date);
        if (logDate >= start && logDate <= end) {
          caloriesSum += h.caloriesBurned || 0;
        }
      });

      points.push({
        label,
        calories: caloriesSum
      });
    }
    return points;
  };

  const monthlyPoints = getMonthlyPoints();
  const maxCalories = Math.max(...monthlyPoints.map(p => p.calories), 100);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-6"
    >
      {/* Title */}
      <motion.div variants={itemVariants} className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-wider text-orange-accent">Activity Analytics</span>
        <h2 className="font-heading text-4xl font-black text-charcoal leading-none uppercase">Progress Logs</h2>
      </motion.div>

      {/* Stats Counter with 3D animation on change */}
      <motion.div variants={itemVariants} className="grid grid-cols-3 gap-3">
        {/* Weight Card - peach tint */}
        <Card tint={1} className="flex flex-col items-center justify-center p-4 text-center gap-1 min-h-22.5 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Weight</span>
          <span className="font-heading text-2xl font-extrabold text-charcoal leading-none">
            {latestMeasure ? <AnimatedCounter value={latestMeasure.weight} decimal={true} /> : "--"}
            <span className="text-xs font-bold text-gray-500 ml-0.5">{unitPref}</span>
          </span>
        </Card>

        {/* Body Fat Card - lavender tint */}
        <Card tint={2} className="flex flex-col items-center justify-center p-4 text-center gap-1 min-h-22.5 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">Body Fat</span>
          <span className="font-heading text-2xl font-extrabold text-charcoal leading-none">
            {latestMeasure?.bodyFat ? <AnimatedCounter value={latestMeasure.bodyFat} decimal={true} /> : "--"}
            <span className="text-xs font-bold text-gray-500 ml-0.5">%</span>
          </span>
        </Card>

        {/* BMI Card - mint tint */}
        <Card tint={3} className="flex flex-col items-center justify-center p-4 text-center gap-1 min-h-22.5 shadow-sm">
          <span className="text-[9px] font-bold uppercase tracking-wider text-gray-500">BMI</span>
          <span className="font-heading text-2xl font-extrabold text-charcoal leading-none">
            {bmiResults ? <AnimatedCounter value={bmiResults.bmi} decimal={true} /> : "--"}
          </span>
        </Card>
      </motion.div>

      {/* Weekly Activity Bar Chart: Custom SVG, Orange gradient fill, dark background */}
      <motion.div variants={itemVariants}>
        <Card darkGlass={true} className="flex flex-col gap-4 p-5 border-orange-accent/20">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-orange-accent" />
            <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">Weekly Frequency</h3>
          </div>
          
          {/* Custom SVG Bar Chart */}
          <div className="w-full h-36 bg-black/20 rounded-2xl p-4 flex items-end justify-between relative">
            <div className="absolute inset-x-4 top-2 flex flex-col justify-between h-20 text-[8px] text-white/20 select-none border-l border-white/5 pl-1.5 pointer-events-none">
              <span className="border-b border-white/5 w-full pb-0.5">High Intensity</span>
              <span className="border-b border-white/5 w-full pb-0.5">Active</span>
              <span className="w-full">Rest</span>
            </div>

            {weeklyData.map((d, idx) => {
              // Calculate height percentage
              const pct = (d.count / maxWeeklyCount) * 80; // max height is 80%
              const barHeight = Math.max(pct, 8); // minimum 8% height for visibility
              
              return (
                <div key={idx} className="flex flex-col items-center flex-1 gap-2 group z-10">
                  <div className="relative w-7 flex justify-center items-end h-20">
                    <div 
                      className={`w-4 bg-linear-to-t from-orange-accent to-amber-500 rounded-t-md transition-all duration-700 ease-out shadow-[0_0_10px_rgba(255,107,0,0.15)] group-hover:scale-x-110 group-hover:shadow-[0_0_15px_rgba(255,107,0,0.4)] ${
                        d.count > 0 ? "opacity-100" : "opacity-20"
                      }`}
                      style={{ height: `${barHeight}%` }}
                    />
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full mb-1 opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal text-white text-[8px] font-bold py-1 px-1.5 rounded border border-white/10 shadow-lg pointer-events-none whitespace-nowrap">
                      {d.count} session{d.count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-white/50">{d.dayName}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </motion.div>

      {/* Monthly Calories Line Chart: Custom SVG smooth curve, orange line, dot markers */}
      <motion.div variants={itemVariants}>
        <Card darkGlass={true} className="flex flex-col gap-4 p-5 border-orange-accent/20">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-orange-accent" />
            <h3 className="font-heading text-xl font-bold uppercase tracking-wider text-white">Caloric Burn Trend</h3>
          </div>

          {/* Custom SVG Line Chart */}
          <div className="w-full h-36 bg-black/20 rounded-2xl p-4 relative">
            <svg viewBox="0 0 320 100" className="w-full h-full">
              {/* Gridlines */}
              <line x1="10" y1="20" x2="310" y2="20" stroke="#2e2e2e" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="50" x2="310" y2="50" stroke="#2e2e2e" strokeWidth="1" strokeDasharray="3 3" />
              <line x1="10" y1="80" x2="310" y2="80" stroke="#2e2e2e" strokeWidth="1" strokeDasharray="3 3" />

              {/* Generate points coordinates: x from 20 to 300, y from 80 to 20 */}
              {(() => {
                const width = 280;
                const height = 60;
                const points = monthlyPoints.map((p, idx) => {
                  const x = 20 + (idx * (width / 5));
                  const y = 80 - ((p.calories / maxCalories) * height);
                  return { x, y, calories: p.calories };
                });

                // Generate path string
                // Let's create a smooth curved path string
                let dPath = `M ${points[0].x} ${points[0].y}`;
                for (let i = 1; i < points.length; i++) {
                  const p0 = points[i - 1];
                  const p1 = points[i];
                  const cpX1 = p0.x + (p1.x - p0.x) / 2;
                  const cpY1 = p0.y;
                  const cpX2 = p0.x + (p1.x - p0.x) / 2;
                  const cpY2 = p1.y;
                  dPath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
                }

                return (
                  <>
                    {/* Glow Backing Path */}
                    <path
                      d={dPath}
                      fill="none"
                      stroke="#FF6B00"
                      strokeWidth="5"
                      className="opacity-20"
                    />
                    {/* Foreground Path */}
                    <path
                      d={dPath}
                      fill="none"
                      stroke="#FF6B00"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    {/* Points markers dots */}
                    {points.map((p, idx) => (
                      <g key={idx} className="group cursor-pointer">
                        <circle
                          cx={p.x}
                          cy={p.y}
                          r="5"
                          fill="#FF6B00"
                          stroke="#ffffff"
                          strokeWidth="1.5"
                          className="transition-all duration-300 hover:r-7 hover:fill-amber-500"
                        />
                        {/* Tooltip value */}
                        <text
                          x={p.x}
                          y={p.y - 10}
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="7"
                          fontWeight="bold"
                          className="opacity-0 group-hover:opacity-100 transition-opacity bg-charcoal"
                        >
                          {p.calories}
                        </text>
                      </g>
                    ))}
                  </>
                );
              })()}
            </svg>

            {/* X-Axis Labels */}
            <div className="absolute inset-x-4 bottom-1 flex justify-between text-[8px] text-white/40 font-bold uppercase tracking-wider pointer-events-none select-none">
              <span>Past Month</span>
              <span>Today</span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Personal Records Table: Card per exercise with PR badge */}
      <motion.div variants={itemVariants}>
        <Card className="flex flex-col gap-4 p-5 shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
            <Trophy size={18} className="text-orange-accent" />
            <h3 className="font-heading text-2xl font-bold tracking-wider text-charcoal uppercase">Personal Records</h3>
          </div>

          {Object.keys(personalRecords).length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400 font-bold uppercase tracking-wider">
              No personal records logged yet.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {Object.entries(personalRecords).map(([exName, weight], idx) => {
                // Card per exercise, rotating gradient tint!
                const tintNum = (idx % 5) + 1;
                return (
                  <Card 
                    key={exName} 
                    tint={tintNum} 
                    hover3d={true}
                    className="flex justify-between items-center py-3.5 px-4 shadow-sm border border-orange-accent/5"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-orange-accent/10 flex items-center justify-center text-orange-accent shrink-0">
                        <Sparkles size={14} className="fill-orange-accent" />
                      </div>
                      <span className="font-bold text-xs text-charcoal uppercase tracking-wide truncate">{exName}</span>
                    </div>
                    
                    <Badge variant="orange" className="font-bold text-xs shrink-0 py-1.5 px-3">
                      {formatWeight(weight, unitPref)}
                    </Badge>
                  </Card>
                );
              })}
            </div>
          )}
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default Progress;
