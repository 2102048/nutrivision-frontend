import React from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceLine
} from "recharts";
import { useApp } from "../context/useApp";
import { Flame, Trophy } from "lucide-react";

/* =======================
HELPERS
======================= */
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const toIST = (date) => {
  return new Date(date.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
};

const StatusLegend = () => (
  <div className="flex flex-wrap gap-4 mb-6">
    {[
      { color: "bg-green-500", label: "Good Day" },
      { color: "bg-yellow-400", label: "Near Goal" },
      { color: "bg-red-500", label: "High" },
      { color: "bg-slate-100", label: "No Data" },
    ].map((item) => (
      <div key={item.label} className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${item.color}`} />
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {item.label}
        </span>
      </div>
    ))}
  </div>
);

const CaloriesChart = () => {
  const { filteredHistory = [], viewMode, goal, goalHistory = [] } = useApp();

  const getGoalForDate = (date) => {
    const d = new Date(date);
    const match = goalHistory.find(
      (g) => new Date(g.goal_date).toDateString() === d.toDateString()
    );
    return match?.calorie_goal || goal?.calorie_goal || 2000;
  };

  /* =======================
  DAILY VIEW
  ======================= */
  if (viewMode === "daily") {
    const data = [...filteredHistory]
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .map((meal) => {
        const date = parseDate(meal.created_at);
        if (!date) return null;
        return {
          label: date.toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
          }),
          calories: Number(meal.calories || 0),
        };
      })
      .filter(Boolean);

    if (!data.length) return <div className="h-64 flex items-center justify-center text-slate-400 font-medium">No meals logged today</div>;

    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
            <Tooltip 
              contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontWeight: 'bold', color: '#22c55e' }}
            />
            <Line 
              type="monotone" 
              dataKey="calories" 
              stroke="#22c55e" 
              strokeWidth={4} 
              dot={{ r: 4, fill: '#22c55e', strokeWidth: 2, stroke: '#fff' }} 
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* =======================
  WEEKLY VIEW (STRICT SUNDAY START)
  ======================= */
  if (viewMode === "weekly") {
    const calorieMap = {};
    filteredHistory.forEach((meal) => {
      const date = parseDate(meal.created_at);
      if (!date) return;
      calorieMap[toIST(date).toDateString()] = (calorieMap[toIST(date).toDateString()] || 0) + Number(meal.calories || 0);
    });

    // Calculate the start of the current week (Sunday)
    const today = toIST(new Date());
    const dayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    const sunday = new Date(today);
    sunday.setDate(today.getDate() - dayOfWeek);

    const data = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sunday);
      d.setDate(sunday.getDate() + i);
      const dateString = d.toDateString();
      
      data.push({
        label: d.toLocaleDateString("en-IN", { weekday: 'short', day: 'numeric' }),
        calories: calorieMap[dateString] || 0,
        fullDate: d
      });
    }

    const currentGoal = goal?.calorie_goal || 2000;

    return (
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '12px', border: 'none' }} />
            <ReferenceLine y={currentGoal} stroke="#cbd5e1" strokeDasharray="5 5" label={{ position: 'right', value: 'Goal', fill: '#94a3b8', fontSize: 10 }} />
            <Bar dataKey="calories" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={32} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  /* =======================
  MONTHLY HEATMAP
  ======================= */
  const monthGrouped = {};
  filteredHistory.forEach((meal) => {
    const date = parseDate(meal.created_at);
    if (!date) return;
    const day = toIST(date).getDate();
    monthGrouped[day] = (monthGrouped[day] || 0) + Number(meal.calories || 0);
  });

  const now = toIST(new Date());
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  let goodDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const cal = monthGrouped[d] || 0;
    if (cal > 0 && cal <= getGoalForDate(new Date(year, month, d)) * 1.1) goodDays++;
  }
  const consistency = Math.round((goodDays / daysInMonth) * 100);

  let streak = 0;
  for (let d = now.getDate(); d >= 1; d--) {
    const cal = monthGrouped[d] || 0;
    if (cal > 0 && cal <= getGoalForDate(new Date(year, month, d)) * 1.1) streak++;
    else if (d === now.getDate() && cal === 0) continue;
    else break;
  }

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-xl text-orange-600">
            <Flame size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Current Streak</p>
            <p className="text-xl font-black text-slate-900 leading-none">{streak} Days</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 p-2 rounded-xl text-blue-600">
            <Trophy size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-slate-400 leading-none mb-1">Consistency</p>
            <p className="text-xl font-black text-slate-900 leading-none">{consistency}%</p>
          </div>
        </div>
      </div>

      <StatusLegend />

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-[10px] font-bold text-slate-300 uppercase py-1">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2 pb-2">
        {[...Array(offset)].map((_, i) => <div key={`empty-${i}`} />)}
        {[...Array(daysInMonth)].map((_, i) => {
          const day = i + 1;
          const calories = monthGrouped[day] || 0;
          const dailyGoal = getGoalForDate(new Date(year, month, day));
          
          let bgColor = "bg-slate-100 text-slate-400";
          if (calories > 0) {
            if (calories <= dailyGoal * 0.9) bgColor = "bg-green-500 text-white shadow-sm shadow-green-100";
            else if (calories <= dailyGoal * 1.1) bgColor = "bg-yellow-400 text-white shadow-sm shadow-yellow-100";
            else bgColor = "bg-red-500 text-white shadow-sm shadow-red-100";
          }

          return (
            <div
              key={day}
              className={`aspect-square rounded-xl flex items-center justify-center text-[11px] font-bold transition-all hover:scale-110 cursor-default ${bgColor}`}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CaloriesChart;