import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

// Helper to get past 7 days dates and names
const getWeeklyData = (history) => {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();
  
  // Initialize last 7 days of week with 0 workouts
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (6 - i));
    return {
      dateStr: d.toISOString().split("T")[0],
      dayName: days[d.getDay()],
      count: 0
    };
  });

  // Populate from history
  history.forEach((h) => {
    const matchingDay = last7Days.find(day => day.dateStr === h.date);
    if (matchingDay) {
      matchingDay.count += 1;
    }
  });

  return last7Days;
};

// Helper to get monthly volume/calories burned
const getMonthlyData = (history) => {
  // Group by date for last 30 days
  const last30Days = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    last30Days.push({
      dateStr,
      label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      calories: 0,
      duration: 0
    });
  }

  history.forEach((h) => {
    const matchingDay = last30Days.find(day => day.dateStr === h.date);
    if (matchingDay) {
      matchingDay.calories += h.caloriesBurned || 0;
      matchingDay.duration += Math.round(h.durationSeconds / 60) || 0;
    }
  });

  // Filter out days with no activity to keep the chart clean, or display cumulative curve
  return last30Days;
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[rgba(201,168,76,0.3)] p-3 rounded-xl shadow-lg text-xs">
        <p className="font-semibold text-gray-500 mb-1">{label}</p>
        <p className="font-bold text-charcoal">
          {payload[0].name}: <span className="text-gold">{payload[0].value}</span>
        </p>
      </div>
    );
  }
  return null;
};

export const WeeklyFrequencyChart = ({ history = [] }) => {
  const data = getWeeklyData(history);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <XAxis 
            dataKey="dayName" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: "bold" }} 
          />
          <YAxis 
            allowDecimals={false}
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#9ca3af", fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(201,168,76,0.05)" }} />
          <Bar 
            dataKey="count" 
            name="Workouts"
            fill="#C9A84C" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const MonthlyVolumeChart = ({ history = [] }) => {
  const data = getMonthlyData(history);

  return (
    <div className="w-full h-48">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 5, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#9ca3af", fontSize: 9 }}
            interval={6} // show less ticks
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: "#9ca3af", fontSize: 10 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="calories" 
            name="Calories Burned (kcal)"
            stroke="#C9A84C" 
            strokeWidth={3} 
            dot={{ r: 3, fill: "#C9A84C", strokeWidth: 0 }}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
