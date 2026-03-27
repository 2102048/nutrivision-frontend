import { useState, useEffect } from "react";
import { calculateBMI, getBMIHistory } from "../../services/api";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, ReferenceArea
} from "recharts";

import { useApp } from "../../context/useApp";

const BMI = () => {
  const { updateGoal } = useApp();

  const [form, setForm] = useState({
    height_cm: "",
    weight_kg: "",
    age: "",
    gender: "male",
    activity_level: "moderate",
  });

  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [goalsApplied, setGoalsApplied] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getBMIHistory();
        if (!data || data.length === 0) return;

        setHistory(data.map(item => ({
          ...item,
          created_at: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        })));

        const latest = data[data.length - 1];
        setForm({
          height_cm: latest.height_cm || "",
          weight_kg: latest.weight_kg || "",
          age: latest.age || "",
          gender: latest.gender || "male",
          activity_level: latest.activity_level || "moderate",
        });

        setResult({
          bmi: latest.bmi,
          category: latest.category,
          recommended_calories: latest.recommended_calories,
        });
      } catch (error) {
        console.error("Failed to load BMI history:", error);
      }
    };
    fetchHistory();
  }, []);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const response = await calculateBMI(form);
      setResult(response);
      setGoalsApplied(false); // Reset sync state when new data is calculated

      const updated = await getBMIHistory();
      setHistory(updated.map(item => ({
        ...item,
        created_at: new Date(item.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      })));
    } catch (error) {
      console.error("BMI calculation failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyBMIGoals = async () => {
    if (!result?.recommended_calories) return;
    const cal = Number(result.recommended_calories);
    
    try {
      // Explicitly passing the source so the Dashboard can display it
      await updateGoal({
        protein_goal: Math.round((cal * 0.30) / 4),
        carbs_goal: Math.round((cal * 0.40) / 4),
        fat_goal: Math.round((cal * 0.30) / 9),
        goal_source: "bmi" 
      });
      setGoalsApplied(true);
    } catch (error) {
      console.error("Failed to apply goals:", error);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">Metabolic Profile</h2>
          <p className="text-slate-500 font-medium">Precision tracking and goal synchronization.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* INPUT SIDEBAR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Body Metrics</h3>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Height (cm)</label>
                  <input type="number" value={form.height_cm} onChange={e => setForm({ ...form, height_cm: e.target.value })} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Weight (kg)</label>
                  <input type="number" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Age</label>
                  <input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Gender</label>
                  <select value={form.gender} onChange={e => setForm({ ...form, gender: e.target.value })} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Daily Activity</label>
                <select value={form.activity_level} onChange={e => setForm({ ...form, activity_level: e.target.value })} className="w-full bg-slate-50 border-none p-4 rounded-2xl text-slate-700 font-bold focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all">
                  <option value="sedentary">Sedentary</option>
                  <option value="light">Light Active</option>
                  <option value="moderate">Moderate</option>
                  <option value="active">Very Active</option>
                </select>
              </div>

              <button onClick={handleSubmit} disabled={loading} className="w-full bg-slate-900 hover:bg-black text-white font-black py-5 rounded-3xl shadow-xl shadow-slate-200 transition-all active:scale-95 disabled:opacity-50">
                {loading ? "Calculating..." : "Update Analytics"}
              </button>
            </div>
          </div>
        </div>

        {/* RESULTS & ANALYTICS */}
        <div className="lg:col-span-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {result && (
              <>
                <div className="bg-slate-900 text-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                   <div className="flex justify-between items-start mb-4">
                      <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">BMI Category</p>
                      {/* RESTORED SOURCE LABEL */}
                      {goalsApplied && (
                        <span className="bg-indigo-500/20 text-indigo-300 text-[9px] font-black px-2 py-1 rounded-lg uppercase tracking-tighter border border-indigo-500/30">
                          Goal Source: BMI
                        </span>
                      )}
                   </div>
                   <h4 className="text-4xl font-black mb-2">{result.category}</h4>
                   <p className="text-slate-400 text-sm font-medium">Metabolic analysis synced with your profile.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 flex flex-col justify-between shadow-sm">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 text-center">Recommended Intake</p>
                    <div className="text-center">
                      <span className="text-5xl font-black text-slate-800">{result.recommended_calories}</span>
                      <span className="text-xs font-bold text-slate-400 ml-2 uppercase">kcal</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="h-2 w-2 mt-1.5 rounded-full bg-indigo-500 animate-pulse shrink-0"></div>
                    <p className="text-[11px] font-medium text-slate-500 leading-normal italic">
                      Clicking below will set your global **Daily Goals** to these values and label the source as **BMI**.
                    </p>
                  </div>

                  <button 
                    onClick={applyBMIGoals} 
                    disabled={goalsApplied} 
                    className={`w-full mt-4 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                      goalsApplied 
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100" 
                      : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 active:scale-95"
                    }`}
                  >
                    {goalsApplied ? "✓ Source Set to BMI" : "Update Daily Goals"}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* PROGRESS CHART */}
          <div className="bg-white border border-slate-200 p-8 rounded-[3rem] shadow-sm">
             <div className="flex items-center justify-between mb-10">
                <h3 className="text-xl font-black text-slate-800 tracking-tight">Physiological Trend</h3>
             </div>
             
             <div className="h-[340px] w-full">
               <ResponsiveContainer>
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="colorBmi" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="created_at" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} dy={15} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: '700'}} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'}} />
                    <ReferenceArea y1={18.5} y2={25} fill="#f0fdf4" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="bmi" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorBmi)" />
                  </AreaChart>
               </ResponsiveContainer>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BMI;