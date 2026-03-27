import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useApp } from "../context/useApp";

const MacroPieChart = () => {
  const { macroPercentages } = useApp();

  const data = [
    { name: "Protein", value: Number(macroPercentages?.protein || 0) },
    { name: "Carbs", value: Number(macroPercentages?.carbs || 0) },
    { name: "Fat", value: Number(macroPercentages?.fat || 0) },
  ];

  const hasData = data.some((item) => item.value > 0);

  if (!hasData) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-slate-300 italic text-sm">
        No macro distribution yet
      </div>
    );
  }

  // ✅ MATCHING DASHBOARD COLORS
  const COLORS = ["#3b82f6", "#f59e0b", "#ef4444"]; 

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={70} // Makes it a donut
            outerRadius={95}
            paddingAngle={8} // Space between slices
            cornerRadius={10} // Rounded slice ends
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]} 
                className="hover:opacity-80 transition-opacity outline-none"
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ 
              borderRadius: '16px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              padding: '12px',
              fontSize: '12px'
            }}
            itemStyle={{ fontWeight: 'bold' }}
            formatter={(value) => [`${value}%`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MacroPieChart;