import { useContext, useState, useMemo, useRef } from "react";
import { AppContext } from "../../context/AppContext";
import { 
  Search, 
  Trash2, 
  Filter, 
  Clock, 
  ChevronRight,
  UtensilsCrossed,
  Calendar
} from 'lucide-react';

/* =======================
   SAFE DATE PARSER
======================= */
const parseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
};

/* =======================
   FORMAT DD-MM-YYYY
======================= */
const formatDateDisplay = (value) => {
  if (!value) return "Select Date";

  const date = new Date(value);
  if (isNaN(date)) return "Select Date";

  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();

  return `${dd}-${mm}-${yyyy}`;
};

const History = () => {
  const { history, deleteMeal } = useContext(AppContext);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [quickFilter, setQuickFilter] = useState("all");

  const dateInputRef = useRef(null);

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

  const sortedMeals = useMemo(() => {
    return [...filteredMeals].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at)
    );
  }, [filteredMeals]);

  return (
    <div className="max-w-3xl lg:max-w-4xl mx-auto space-y-6 pb-20 px-3 sm:px-4 md:px-6">
      
      {/* HEADER */}
      <div className="text-center mt-4">
        <h1 className="text-2xl md:text-3xl font-bold">Meal History</h1>
        <p className="text-slate-500 text-sm md:text-base">
          Review and manage your past logs
        </p>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-4 md:p-6 rounded-3xl shadow-sm border space-y-4">
        
        {/* SEARCH */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search meal name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 p-3 pl-10 rounded-xl"
          />
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* CATEGORY */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-3 bg-slate-50 rounded-xl"
            >
              <option value="All">All Categories</option>
              {["Breakfast", "Lunch", "Dinner", "Snack"].map(c => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <Filter size={14} className="absolute right-3 top-3 text-slate-400" />
          </div>

          {/* ✅ DATE FIX */}
          <div
            onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
            className="relative cursor-pointer"
          >
            <div className="w-full p-3 bg-slate-50 rounded-xl flex justify-between items-center">
              <span className="font-semibold text-slate-700">
                {formatDateDisplay(selectedDate)}
              </span>
              <Calendar size={16} className="text-slate-400" />
            </div>

            {/* Hidden Native Input */}
            <input
              ref={dateInputRef}
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                if (e.target.value) setQuickFilter("all");
              }}
              className="absolute inset-0 opacity-0 pointer-events-none"
            />
          </div>
        </div>

        {/* QUICK FILTER */}
        <div className="flex gap-2 overflow-x-auto">
          {["all", "today", "week", "month"].map((filter) => (
            <button
              key={filter}
              onClick={() => {
                setQuickFilter(filter);
                setSelectedDate("");
              }}
              className={`px-3 py-2 rounded-full text-xs ${
                quickFilter === filter && !selectedDate
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100"
              }`}
            >
              {filter === "all" ? "Everything" : filter}
            </button>
          ))}
        </div>
      </div>

      {/* LIST */}
      <div className="space-y-4">
        {sortedMeals.map((meal) => {
          const d = parseDate(meal.created_at);

          return (
            <div key={meal.id} className="bg-white p-4 rounded-2xl border">
              <div className="flex justify-between">
                <h3 className="font-bold">{meal.name}</h3>
                <Trash2 onClick={() => deleteMeal(meal.id)} size={18} />
              </div>

              <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
                <Clock size={14} />
                {d?.toLocaleString("en-IN")}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default History;