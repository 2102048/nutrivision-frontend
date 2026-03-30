import { Link, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useApp } from "../context/useApp";
import {
  Squares2X2Icon,
  CameraIcon,
  ClockIcon,
  UserCircleIcon,
  ScaleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  CheckBadgeIcon,
  Bars3Icon,
  XMarkIcon
} from "@heroicons/react/24/outline";

const navGroups = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Scan Food", path: "/scan", icon: CameraIcon },
      { name: "History", path: "/history", icon: ClockIcon },
    ],
  },
  {
    label: "Analyze",
    items: [
      { name: "AI Assistant", path: "/ai-assistant", icon: SparklesIcon },
      { name: "BMI Calculator", path: "/bmi", icon: ScaleIcon },
    ],
  },
  {
    label: "Account",
    items: [{ name: "Profile", path: "/profile", icon: UserCircleIcon }],
  },
];

function Sidebar() {
  const { goal, updateGoal } = useApp();
  const [showGoals, setShowGoals] = useState(false);
  const [saving, setSaving] = useState(false);
  const location = useLocation();
  const goalsEndRef = useRef(null);

  const [form, setForm] = useState({
    protein_goal: "",
    carbs_goal: "",
    fat_goal: "",
  });

  // Mobile drawer state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-scroll for goals
  useEffect(() => {
    if (showGoals) {
      goalsEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [showGoals]);

  useEffect(() => {
    if (goal) {
      setForm({
        protein_goal: goal.protein_goal ?? "",
        carbs_goal: goal.carbs_goal ?? "",
        fat_goal: goal.fat_goal ?? "",
      });
    }
  }, [goal]);

  const handleChange = (field, value) => {
    if (value === "" || /^\d+$/.test(value)) {
      setForm((prev) => ({ ...prev, [field]: value }));
    }
  };

  const calculatedCalories =
    goal?.calorie_goal ??
    (Number(form.protein_goal || 0) * 4 +
      Number(form.carbs_goal || 0) * 4 +
      Number(form.fat_goal || 0) * 9);

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGoal({
        calorie_goal: calculatedCalories,
        protein_goal: Number(form.protein_goal) || 0,
        carbs_goal: Number(form.carbs_goal) || 0,
        fat_goal: Number(form.fat_goal) || 0,
        goal_source: "manual",
      });
    } catch (err) {
      console.error("Save failed:", err.message);
    } finally {
      setSaving(false);
    }
  };

  const isBMISource = goal?.goal_source === "bmi";
  const isManualSource = goal?.goal_source === "manual";

  const sidebarContent = (
    <div className="flex flex-col h-full w-72 bg-white border-r border-slate-100 font-sans">
      {/* Brand */}
      <div className="p-6 flex items-center gap-3 text-2xl font-black text-slate-900">
        <div className="bg-linear-to-br from-green-500 to-green-600 p-2 rounded-xl text-white shadow-md">
          <SparklesIcon className="w-6 h-6" />
        </div>
        NutriVision
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 overflow-y-auto space-y-6 pb-4 custom-scrollbar">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1">
            <h3 className="px-4 text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-2">
              {group.label}
            </h3>
            {group.items.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    isActive
                      ? "bg-green-50 text-green-700 font-semibold"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                  onClick={() => setMobileOpen(false)}
                >
                  {isActive && (
                    <div className="absolute left-0 w-1 h-6 bg-green-500 rounded-r-full" />
                  )}
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive
                        ? "text-green-600"
                        : "text-slate-400 group-hover:text-slate-600"
                    }`}
                  />
                  <span className="text-[14px]">{item.name}</span>
                </Link>
              );
            })}
          </div>
        ))}

        {/* Daily Goals Section */}
        <div className="pt-4 border-t border-slate-50">
          <button
            onClick={() => setShowGoals(!showGoals)}
            className={`w-full flex justify-between items-center px-4 py-3 rounded-xl transition-all ${
              showGoals
                ? "bg-slate-50 text-slate-900"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="flex items-center gap-3 font-bold text-[14px]">🎯 Daily Goals</span>
            <div className="flex items-center gap-2">
              {isManualSource && (
                <span className="text-[9px] bg-white text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 font-bold uppercase">
                  Manual
                </span>
              )}
              {isBMISource && (
                <span className="text-[9px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100 font-bold uppercase">
                  BMI
                </span>
              )}
              {showGoals ? (
                <ChevronUpIcon className="w-4 h-4" />
              ) : (
                <ChevronDownIcon className="w-4 h-4" />
              )}
            </div>
          </button>

          {showGoals && (
            <div
              ref={goalsEndRef}
              className="mt-2 px-1 pb-4 animate-in fade-in slide-in-from-top-4 duration-300"
            >
              <div className="p-5 bg-white rounded-2xl space-y-6 border border-slate-200 shadow-sm">
                <div
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
                    isBMISource
                      ? "bg-indigo-50 border-indigo-100 text-indigo-600"
                      : "bg-slate-50 border-slate-100 text-slate-500"
                  }`}
                >
                  <CheckBadgeIcon className="w-4 h-4 shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-tight">
                    {isBMISource ? "Synced with BMI Analysis" : "Manual Macro Targets"}
                  </span>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-wider font-black text-slate-400 block">
                    Daily Calorie Target
                  </label>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900 tracking-tight leading-none">
                      {calculatedCalories}
                    </span>
                    <span className="text-sm text-slate-400 font-bold">kcal</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { label: "Protein", key: "protein_goal", color: "text-blue-600" },
                    { label: "Carbs", key: "carbs_goal", color: "text-orange-600" },
                    { label: "Fats", key: "fat_goal", color: "text-yellow-600" },
                  ].map((m) => (
                    <div key={m.key} className="space-y-2">
                      <label
                        className={`text-[10px] uppercase font-black block leading-none text-center ${m.color}`}
                      >
                        {m.label}
                      </label>
                      <input
                        type="number"
                        value={form[m.key]}
                        onChange={(e) => handleChange(m.key, e.target.value)}
                        className="w-full py-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-[15px] focus:ring-2 focus:ring-green-500/20 focus:border-green-500 outline-none font-bold text-slate-800 transition-all shadow-inner appearance-none m-0"
                      />
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full py-4 bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 transition-all shadow-lg shadow-green-100 active:scale-[0.97]"
                >
                  {saving ? "Updating..." : "Apply Goals"}
                </button>

                <p className="text-[10px] text-center text-slate-400 font-medium italic">
                  Changes will set source to "Manual"
                </p>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="sm:hidden flex items-center p-3 bg-white border-b border-slate-100">
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-slate-600 hover:text-slate-900 transition-colors"
        >
          {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
        <span className="ml-3 font-bold text-lg text-slate-900">NutriVision</span>
      </div>

      {/* Sidebar */}
      <div className="hidden sm:flex lg:shrink-0">{sidebarContent}</div>

      {/* Mobile Off-canvas */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black bg-opacity-30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="relative w-72 bg-white border-r border-slate-100">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}

export default Sidebar;