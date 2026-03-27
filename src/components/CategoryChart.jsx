import React from 'react';
import { useApp } from "../context/useApp"; // Match your other components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell, 
} from "recharts";

const CategoryChart = () => {
  const { categoryTotals } = useApp();

  // 1. Convert object to array for Recharts
  const data = categoryTotals 
    ? Object.keys(categoryTotals).map((key) => ({
        category: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize (e.g., "breakfast")
        calories: categoryTotals[key],
      }))
    : [];

  // 🛑 Loading or Empty State
  if (!categoryTotals || data.every((item) => item.calories === 0)) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center space-y-2">
        <div className="text-slate-300 italic text-sm font-medium">
          No meal data categorized yet
        </div>
      </div>
    );
  }

  // Custom colors for different meal types to make it pop
  const COLORS = {
    Breakfast: '#06b6d4', // Cyan 500 (Fresh, Morning vibe)
    Lunch: '#f43f5e',     // Rose 500 (High energy, distinct from blue/green)
    Dinner: '#8b5cf6',    // Violet 500 (Calm, evening tone)
    Snack: '#f59e0b',     // Amber 500 (Bright, "pick-me-up" color)
    Other: '#94a3b8',     // Slate 400 (Neutral fallback)
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="category" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#94a3b8', fontSize: 12 }} 
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
              padding: '12px'
            }}
          />
          <Bar 
            dataKey="calories" 
            radius={[10, 10, 10, 10]} 
            barSize={40}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[entry.category] || '#10b981'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryChart;