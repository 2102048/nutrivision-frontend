import { useContext, useState, useMemo } from "react";
import { AppContext } from "../../context/AppContext";
import { 
  Search, 
  Calendar, 
  Trash2, 
  Filter, 
  Clock, 
  ChevronRight,
  UtensilsCrossed 
} from 'lucide-react';

/* =======================
   SAFE DATE PARSER
======================= */
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

const History = () => {
  const { history, deleteMeal } = useContext(AppContext);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [quickFilter, setQuickFilter] = useState("all"); // Changed default to "all" to avoid conflicts

  /* =======================
      FILTER LOGIC
  ======================= */
  const filteredMeals = useMemo(() => {
    const now = new Date();

    return history.filter((meal) => {
      const d = parseDate(meal.created_at);
      if (!d) return false;

      // 🔎 1. Search filter
      if (
        searchTerm &&
        !meal.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }

      // 🏷 2. Category filter
      if (
        selectedCategory !== "All" &&
        meal.category !== selectedCategory
      ) {
        return false;
      }

      // 📅 3. Specific date filter (PRIORITY)
      // We compare YYYY-MM-DD strings to ignore time differences
      if (selectedDate) {
        const selected = new Date(selectedDate);
        const isSameDay = 
          d.getDate() === selected.getDate() &&
          d.getMonth() === selected.getMonth() &&
          d.getFullYear() === selected.getFullYear();
        
        if (!isSameDay) return false;
      }

      // ⚡ 4. Quick filters (Only apply if no specific date is picked)
      if (!selectedDate && quickFilter !== "all") {
        if (quickFilter === "today") {
          const isToday = 
            d.getDate() === now.getDate() &&
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
          if (!isToday) return false;
        }

        if (quickFilter === "week") {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          if (d < startOfWeek) return false;
        }

        if (quickFilter === "month") {
          const isThisMonth = 
            d.getMonth() === now.getMonth() &&
            d.getFullYear() === now.getFullYear();
          if (!isThisMonth) return false;
        }
      }

      return true;
    });
  }, [history, selectedCategory, searchTerm, selectedDate, quickFilter]);

  /* =======================
      SORT
  ======================= */
  const sortedMeals = useMemo(() => {
    return [...filteredMeals].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [filteredMeals]);

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4">
      {/* HEADER */}
      <div className="text-center space-y-1 mt-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Meal History</h1>
        <p className="text-slate-500 font-medium">Review and manage your past logs</p>
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 space-y-4">
        {/* 🔍 SEARCH */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search meal name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-4 pl-12 rounded-2xl outline-none transition-all font-medium shadow-inner"
          />
          <Search size={20} className="absolute left-4 top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 🏷 CATEGORY */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-none appearance-none cursor-pointer"
            >
              <option value="All">All Categories</option>
              {["Breakfast", "Lunch", "Dinner", "Snack"].map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <Filter size={14} className="absolute right-3 top-4 text-slate-400 pointer-events-none" />
          </div>

          {/* 📅 DATE PICKER */}
          <div className="relative">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if(e.target.value) setQuickFilter("all"); // Clear quick filter if date is picked
              }}
              className="w-full p-3 bg-slate-50 rounded-xl border-none font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* ⚡ QUICK FILTER BUTTONS */}
        <div className="flex justify-between items-center">
           <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {["all", "today", "week", "month"].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setQuickFilter(filter);
                  setSelectedDate(""); // Clear specific date if quick filter is clicked
                }}
                className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  quickFilter === filter && !selectedDate
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {filter === "all" ? "Everything" : filter}
              </button>
            ))}
          </div>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate("")}
              className="text-[10px] font-bold text-blue-600 underline"
            >
              Clear Date
            </button>
          )}
        </div>
      </div>

      {/* 🧾 DATA LIST */}
      <div className="space-y-4">
        {sortedMeals.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-4xl border-2 border-dashed border-slate-100">
            <UtensilsCrossed size={48} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-bold">No meals found for this period.</p>
          </div>
        ) : (
          sortedMeals.map((meal) => {
            const d = parseDate(meal.created_at);

            return (
              <div key={meal.id} className="bg-white p-5 rounded-[28px] shadow-sm border border-slate-100 hover:border-blue-100 transition-all group">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-2 inline-block">
                      {meal.category}
                    </span>
                    <h3 className="font-bold text-lg text-slate-900 capitalize">{meal.name}</h3>
                  </div>
                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors rounded-xl"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-4">
                    {[
                      { l: 'Cal', v: meal.calories, c: 'text-orange-600', bg: 'bg-orange-50' },
                      { l: 'Pro', v: meal.protein, c: 'text-blue-600', bg: 'bg-blue-50' },
                      { l: 'Carb', v: meal.carbs, c: 'text-green-600', bg: 'bg-green-50' },
                      { l: 'Fat', v: meal.fat, c: 'text-purple-600', bg: 'bg-purple-50' },
                    ].map((stat, i) => (
                      <div key={i} className={`${stat.bg} rounded-2xl p-2 text-center`}>
                        <p className={`text-[10px] font-black uppercase ${stat.c} opacity-70`}>{stat.l}</p>
                        <p className={`text-sm font-black ${stat.c}`}>{stat.v}</p>
                      </div>
                    ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock size={14} />
                    <span className="text-xs font-bold">
                      {d ? d.toLocaleString("en-IN", { 
                        dateStyle: 'medium', 
                        timeStyle: 'short' 
                      }) : "Invalid Date"}
                    </span>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default History;