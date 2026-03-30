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
  CheckBadgeIcon 
} from '@heroicons/react/24/outline';

const navGroups = [
  {
    label: "Main",
    items: [
      { name: "Dashboard", path: "/dashboard", icon: Squares2X2Icon },
      { name: "Scan Food", path: "/scan", icon: CameraIcon },
      { name: "History", path: "/history", icon: ClockIcon },
    ]
  },
  {
    label: "Analyze",
    items: [
      { name: "AI Assistant", path: "/ai-assistant", icon: SparklesIcon },
      { name: "BMI Calculator", path: "/bmi", icon: ScaleIcon },
    ]
  },
  {
    label: "Account",
    items: [
      { name: "Profile", path: "/profile", icon: UserCircleIcon },
    ]
  }
];

function Sidebar({ isOpen, setIsOpen }) {
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

  useEffect(() => {
    if (showGoals) {
      goalsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
    (
      Number(form.protein_goal || 0) * 4 +
      Number(form.carbs_goal || 0) * 4 +
      Number(form.fat_goal || 0) * 9
    );

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateGoal({
        calorie_goal: calculatedCalories,
        protein_goal: Number(form.protein_goal) || 0,
        carbs_goal: Number(form.carbs_goal) || 0,
        fat_goal: Number(form.fat_goal) || 0,
        goal_source: "manual"
      });
    } catch (err) {
      console.error("Save failed:", err.message);
    } finally {
      setSaving(false);
    }
  };

  const isBMISource = goal?.goal_source === "bmi";
  const isManualSource = goal?.goal_source === "manual";

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed z-50 top-0 left-0 h-full w-72 bg-white border-r border-slate-100
          transform transition-transform duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:flex
          flex flex-col
        `}
      >
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-3 text-xl font-black text-slate-900">
            <div className="bg-green-600 p-2 rounded-xl text-white">
              <SparklesIcon className="w-5 h-5" />
            </div>
            NutriVision
          </div>

          <button onClick={() => setIsOpen(false)} className="md:hidden text-xl">
            ✕
          </button>
        </div>

        <nav className="flex-1 px-4 overflow-y-auto space-y-6 pb-4">
          {navGroups.map((group) => (
            <div key={group.label}>
              <h3 className="px-4 text-xs font-bold text-slate-400 mb-2">
                {group.label}
              </h3>

              {group.items.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                      isActive
                        ? "bg-green-50 text-green-700 font-semibold"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}

          {/* GOALS */}
          <div className="pt-4 border-t">
            <button
              onClick={() => setShowGoals(!showGoals)}
              className="w-full flex justify-between px-4 py-3"
            >
              🎯 Daily Goals
              <div className="flex items-center gap-2">
                {isManualSource && (
                  <span className="text-[10px] bg-white border px-1 rounded">
                    Manual
                  </span>
                )}
                {isBMISource && (
                  <span className="text-[10px] bg-indigo-50 border px-1 rounded">
                    BMI
                  </span>
                )}
                {showGoals ? <ChevronUpIcon className="w-4" /> : <ChevronDownIcon className="w-4" />}
              </div>
            </button>

            {showGoals && (
              <div ref={goalsEndRef} className="p-4 space-y-4">
                <div className="flex items-center gap-2 text-xs">
                  <CheckBadgeIcon className="w-4 h-4" />
                  {isBMISource ? "Synced with BMI" : "Manual Targets"}
                </div>

                <div className="text-2xl font-bold">
                  {calculatedCalories} kcal
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["protein_goal","carbs_goal","fat_goal"].map((key) => (
                    <input
                      key={key}
                      value={form[key]}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="p-2 border rounded text-center"
                    />
                  ))}
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-green-600 text-white p-3 rounded"
                >
                  {saving ? "Updating..." : "Apply Goals"}
                </button>
              </div>
            )}
          </div>
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;