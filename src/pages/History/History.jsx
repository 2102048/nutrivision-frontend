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
  const [quickFilter, setQuickFilter] = useState("all");

  /* =======================
      FILTER LOGIC
  ======================= */
  const filteredMeals = useMemo(() => {
    const now = new Date();

    return history.filter((meal) => {
      const d = parseDate(meal.created_at);
      if (!d) return false;

      if (
        searchTerm &&
        !meal.name.toLowerCase().includes(searchTerm.toLowerCase())
      ) return false;

      if (
        selectedCategory !== "All" &&
        meal.category !== selectedCategory
      ) return false;

      if (selectedDate) {
        const selected = new Date(selectedDate);
        const isSameDay = 
          d.getDate() === selected.getDate() &&
          d.getMonth() === selected.getMonth() &&
          d.getFullYear() === selected.getFullYear();
        
        if (!isSameDay) return false;
      }

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
    <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-6 pb-20 px-3 sm:px-4 md:px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* HEADER */}
      <div className="text-center space-y-1 mt-4 md:mt-6">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Meal History
        </h1>
        <p className="text-slate-500 font-medium text-sm md:text-base">
          Review and manage your past logs
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 md:p-6 rounded-3xl md:rounded-4xl shadow-sm border border-slate-100 space-y-4">
        
        {/* SEARCH */}
        <div className="relative group">
          <input
            type="text"
            placeholder="Search meal name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-500 focus:bg-white p-3 md:p-4 pl-10 md:pl-12 rounded-2xl outline-none transition-all font-medium shadow-inner text-sm md:text-base"
          />
          <Search size={18} className="absolute left-3 md:left-4 top-3 md:top-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* CATEGORY */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none appearance-none cursor-pointer text-sm md:text-base"
            >
              <option value="All">All Categories</option>
              {["Breakfast", "Lunch", "Dinner", "Snack"].map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-3 top-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* DATE */}
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => {
              setSelectedDate(e.target.value);
              if(e.target.value) setQuickFilter("all");
            }}
            className="w-full p-3 bg-slate-50 rounded-xl font-bold text-slate-700 outline-none text-sm md:text-base"
          />
        </div>

        {/* QUICK FILTER */}
        <div className="flex justify-between items-center gap-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {["all", "today", "week", "month"].map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setQuickFilter(filter);
                  setSelectedDate("");
                }}
                className={`px-3 md:px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest whitespace-nowrap ${
                  quickFilter === filter && !selectedDate
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {filter === "all" ? "Everything" : filter}
              </button>
            ))}
          </div>

          {selectedDate && (
            <button 
              onClick={() => setSelectedDate("")}
              className="text-[10px] font-bold text-blue-600 underline whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {sortedMeals.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-3xl border-2 border-dashed border-slate-100">
            <UtensilsCrossed size={40} className="mx-auto text-slate-200 mb-3" />
            <p className="text-slate-400 font-bold text-sm">
              No meals found for this period.
            </p>
          </div>
        ) : (
          sortedMeals.map((meal) => {
            const d = parseDate(meal.created_at);

            return (
              <div key={meal.id} className="bg-white p-4 md:p-5 rounded-3xl shadow-sm border border-slate-100">
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                      {meal.category}
                    </span>
                    <h3 className="font-bold text-base md:text-lg text-slate-900 capitalize mt-1">
                      {meal.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => deleteMeal(meal.id)}
                    className="p-2 text-slate-300 hover:text-red-500"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-4 gap-2 mb-3">
                  {[
                    { l: 'Cal', v: meal.calories },
                    { l: 'Pro', v: meal.protein },
                    { l: 'Carb', v: meal.carbs },
                    { l: 'Fat', v: meal.fat },
                  ].map((stat, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-2 text-center">
                      <p className="text-[9px] font-bold text-slate-400">{stat.l}</p>
                      <p className="text-xs md:text-sm font-bold">{stat.v}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-slate-400 text-xs">
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    {d ? d.toLocaleString("en-IN", { 
                      dateStyle: 'medium', 
                      timeStyle: 'short' 
                    }) : "Invalid"}
                  </div>
                  <ChevronRight size={16} />
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