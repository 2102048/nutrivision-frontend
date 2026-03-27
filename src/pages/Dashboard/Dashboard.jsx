import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from "../../context/useApp";
import CaloriesChart from "../../components/CaloriesChart";
import MacroPieChart from "../../components/MacroPieChart";
import CategoryChart from "../../components/CategoryChart";
import { Flame, Dumbbell, Wheat, Droplets, Plus, Utensils, Activity, Settings, Sparkles } from 'lucide-react';

/* ================= ✅ REDESIGNED PROGRESS BAR ================= */
const ProgressBar = ({ label, value = 0, goal = 0, icon, color }) => {
  const safeGoal = Number(goal) || 0;
  const safeValue = Number(value) || 0;
  const percent = safeGoal > 0 ? Math.min((safeValue / safeGoal) * 100, 100) : 0;

  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 ${color.bg} ${color.text} rounded-xl flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-slate-500 text-sm font-semibold">{label}</span>
      </div>
      <div className="flex items-end gap-1.5 mt-auto">
        <span className="text-2xl font-bold text-slate-900">{safeValue.toLocaleString()}</span>
        <span className="text-slate-400 text-xs mb-1.5">
          / {safeGoal.toLocaleString()}{label === 'Calories' ? '' : 'g'}
        </span>
      </div>
      <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
        <div 
          className={`${color.bar} h-full rounded-full transition-all duration-700`} 
          style={{ width: `${percent}%` }} 
        />
      </div>
    </div>
  );
};

/* ================= ✅ MAIN DASHBOARD ================= */
const Dashboard = () => {
  const navigate = useNavigate();
  const {
    totals = { calories: 0, protein: 0, carbs: 0, fat: 0 },
    macroPercentages = { protein: 0, carbs: 0, fat: 0 },
    viewMode,
    setViewMode,
    goal,
    goalHistory = [],
    loading = false,
    filteredHistory = [],
  } = useApp();

  /**
   * getDynamicGoal: Calculates the cumulative goal for a period.
   * Logic: Iterates through every day. If no goal found for a day, uses the 
   * most recent previous entry. If none exist, uses the current global goal.
   */
  const getDynamicGoal = (goalKey) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // DAILY MODE
    if (viewMode === "daily") {
      const dateStr = today.toISOString().slice(0, 10);
      const match = goalHistory.find(g => g.goal_date === dateStr);
      return match?.[goalKey] || goal?.[goalKey] || 0;
    }

    // Determine the date range
    let startDate = new Date(today);
    if (viewMode === "weekly") {
      // Start from Sunday of this week
      startDate.setDate(today.getDate() - today.getDay());
    } else if (viewMode === "monthly") {
      // Start from 1st of this month
      startDate.setDate(1);
    }

    let totalGoal = 0;
    let tempDate = new Date(startDate);

    // Iterate through every day of the period (e.g., Sun to Sat or 1st to End of Month)
    const endDate = new Date(startDate);
    if (viewMode === "weekly") endDate.setDate(startDate.getDate() + 6);
    else endDate.setMonth(startDate.getMonth() + 1, 0);

    while (tempDate <= endDate) {
      const dateStr = tempDate.toISOString().slice(0, 10);
      
      // 1. Check for entry on this specific day
      const dayGoal = goalHistory.find(g => g.goal_date === dateStr);
      
      if (dayGoal && dayGoal[goalKey]) {
        totalGoal += dayGoal[goalKey];
      } else {
        // 2. Fallback: Find the most recent goal BEFORE this date
        const previousGoals = goalHistory
          .filter(g => g.goal_date < dateStr)
          .sort((a, b) => new Date(b.goal_date) - new Date(a.goal_date));
        
        const fallbackGoal = previousGoals[0]?.[goalKey] || goal?.[goalKey] || 0;
        totalGoal += fallbackGoal;
      }
      
      tempDate.setDate(tempDate.getDate() + 1);
    }

    return totalGoal;
  };

  if (loading) {
    return <div className="p-10 text-slate-500 font-medium animate-pulse text-center">Analyzing nutrition data...</div>;
  }

  const calorieGoal = getDynamicGoal("calorie_goal") || 2000;
  const calorieLeft = Math.max(calorieGoal - totals.calories, 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-10">
      
      {/* HEADER & VIEW MODE SELECTOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{getGreeting()}</h1>
            <Sparkles className="text-amber-400 w-6 h-6 animate-pulse" />
          </div>
          <p className="text-slate-500 font-medium italic">Overview of your nutritional progress</p>
        </div>
        <div className="flex p-1 bg-white rounded-2xl shadow-sm border border-slate-100 w-fit">
          {["daily", "weekly", "monthly"].map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                viewMode === mode 
                ? "bg-green-500 text-white shadow-lg shadow-green-100" 
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
              }`}
            >
              {mode === "daily" ? "Today" : mode === "weekly" ? "Week" : "Month"}
            </button>
          ))}
        </div>
      </div>

      {/* EMPTY STATE */}
      {filteredHistory.length === 0 && (
        <div 
          onClick={() => navigate('/scan')}
          className="bg-white rounded-[32px] border-2 border-dashed border-slate-200 p-12 text-center cursor-pointer hover:border-green-400 hover:bg-green-50/20 transition-all group"
        >
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
            <Plus className="text-green-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No meals added yet</h3>
          <p className="text-slate-500 mt-1 mb-6">Log your first meal to see your dashboard come to life.</p>
          <span className="text-green-600 font-bold text-sm bg-green-50 px-4 py-2 rounded-full border border-green-100">
            Click to Scan Food Now
          </span>
        </div>
      )}

      {/* TOP ROW: AT A GLANCE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CALORIE HERO CARD */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-10 relative overflow-hidden">
          
          {viewMode === "daily" && (
            <div className="absolute top-6 right-8">
              {goal?.goal_source === "bmi" ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full shadow-sm">
                  <Activity size={12} className="text-indigo-500" />
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">BMI Daily Goal</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full shadow-sm">
                  <Settings size={12} className="text-slate-400" />
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider">Manual Daily Goal</span>
                </div>
              )}
            </div>
          )}

          <div className="relative w-40 h-40 flex-shrink-0">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-50" />
                <circle cx="80" cy="80" r="70" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={440} strokeDashoffset={440 - (Math.min(totals.calories/calorieGoal, 1) * 440)}
                        strokeLinecap="round" className="text-green-500 transition-all duration-1000" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
                <Flame className="w-12 h-12 text-orange-500" />
             </div>
          </div>

          <div className="flex-grow text-center md:text-left">
            <h4 className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">
              {viewMode === "daily" ? "Today's Consumption" : `${viewMode === "weekly" ? "Weekly" : "Monthly"} Target`}
            </h4>
            <div className="flex items-baseline justify-center md:justify-start gap-2">
              <span className="text-5xl font-black text-slate-900">{totals.calories.toLocaleString()}</span>
              <span className="text-slate-400 text-xl font-medium">/ {calorieGoal.toLocaleString()} kcal</span>
            </div>
            <p className="text-slate-500 font-medium mt-2">
              Remaining: <span className="text-green-600 font-bold">{calorieLeft.toLocaleString()} kcal</span>
            </p>
          </div>
        </div>

        <ProgressBar label="Protein" value={totals.protein} goal={getDynamicGoal("protein_goal")} icon={<Dumbbell size={20}/>} color={{bg: 'bg-blue-50', text: 'text-blue-500', bar: 'bg-blue-500'}} />
      </div>

      {/* MACRO ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <ProgressBar label="Carbs" value={totals.carbs} goal={getDynamicGoal("carbs_goal")} icon={<Wheat size={20}/>} color={{bg: 'bg-amber-50', text: 'text-amber-500', bar: 'bg-amber-500'}} />
         <ProgressBar label="Fat" value={totals.fat} goal={getDynamicGoal("fat_goal")} icon={<Droplets size={20}/>} color={{bg: 'bg-red-50', text: 'text-red-500', bar: 'bg-red-500'}} />
         {/* Total Calories Progress Bar (matches hero card) */}
         <ProgressBar label="Calories" value={totals.calories} goal={getDynamicGoal("calorie_goal")} icon={<Flame size={20}/>} color={{bg: 'bg-orange-50', text: 'text-orange-500', bar: 'bg-green-500'}} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col min-h-[450px]">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Calories Trend</h3>
          <div className="flex-grow"><CaloriesChart /></div>
        </div>

        <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Macro Distribution</h3>
          <div className="flex-grow flex items-center justify-center">
            {totals.calories > 0 ? <MacroPieChart /> : <div className="text-slate-300 italic text-sm">No macro data logged</div>}
          </div>
          <div className="flex justify-around mt-8 pt-6 border-t border-slate-50 font-bold text-xs uppercase tracking-widest text-slate-500">
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"/> Prot: {macroPercentages.protein}%</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-amber-500"/> Carb: {macroPercentages.carbs}%</span>
            <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-red-500"/> Fat: {macroPercentages.fat}%</span>
          </div>
        </div>

        <div className="xl:col-span-2 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Calories by Category</h3>
          <div className="h-72"><CategoryChart /></div>
        </div>
      </div>
      
      <div className="text-center text-slate-400 text-xs font-medium pb-8">
        © 2026 NutriVision, Inc.
      </div>
    </div>
  );
};

export default Dashboard;