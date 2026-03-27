import { createContext, useState, useEffect, useMemo, useCallback } from "react";
import {
  getMeals,
  addMeal as apiAddMeal,
  deleteMeal as apiDeleteMeal,
  getGoals,
  updateGoals,
  getGoalHistory
} from "../services/api";

export const AppContext = createContext(null);

export const AppProvider = ({ children }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("daily");
  
  // ✅ UPDATED: Key changed to "access_token" to match api.js
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  
  const [goal, setGoal] = useState(null);

  /* ✅ NEW STATE */
  const [goalHistory, setGoalHistory] = useState([]);

  /* ================= AUTH CONTROL ================= */

  const setAuthToken = (newToken) => {
    if (newToken) {
      // ✅ UPDATED: Key changed to "access_token"
      localStorage.setItem("access_token", newToken);
      setToken(newToken);
    } else {
      // ✅ UPDATED: Key changed to "access_token"
      localStorage.removeItem("access_token");
      setToken(null);
      setHistory([]);
      setGoal(null);
      setGoalHistory([]);
    }
  };

  /* ================= FETCH DATA ================= */

  const loadData = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const [mealsData, goalsData, goalHistoryData] = await Promise.all([
        getMeals(),
        getGoals(),
        getGoalHistory()
      ]);

      setHistory(mealsData || []);
      setGoal(goalsData || null);
      setGoalHistory(goalHistoryData || []);

    } catch (err) {
      console.error("Initial load error:", err.message);
      setHistory([]);
      setGoal(null);
      setGoalHistory([]);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ================= CRUD ================= */

  const addMeal = async (meal) => {
    try {
      const newMeal = await apiAddMeal(meal);

      // ✅ SAFETY FIX (prevents broken totals)
      const safeMeal = {
        ...newMeal,
        created_at: newMeal?.created_at || new Date().toISOString(),
        calories: Number(newMeal?.calories ?? meal.calories ?? 0),
        protein: Number(newMeal?.protein ?? meal.protein ?? 0),
        carbs: Number(newMeal?.carbs ?? meal.carbs ?? 0),
        fat: Number(newMeal?.fat ?? meal.fat ?? 0),
      };

      // ✅ instant UI update
      setHistory((prev) => [...prev, safeMeal]);

      // 🔥 IMPORTANT → sync with backend (fix notifications + totals)
      loadData();

    } catch (err) {
      console.error("Add meal error:", err.message);
    }
  };

  const deleteMeal = async (id) => {
    try {
      await apiDeleteMeal(id);
      setHistory((prev) => prev.filter((m) => m.id !== id));

      // 🔥 keep everything synced
      loadData();

    } catch (err) {
      console.error("Delete meal error:", err.message);
    }
  };

  /* ================= GOAL UPDATE ================= */

  const updateGoal = async (updatedFields) => {
    try {
      if (!goal) return;

      const protein = Number(updatedFields.protein_goal ?? goal.protein_goal ?? 0);
      const carbs = Number(updatedFields.carbs_goal ?? goal.carbs_goal ?? 0);
      const fat = Number(updatedFields.fat_goal ?? goal.fat_goal ?? 0);

      // ✅ FIX: USE calorie_goal if provided
      const calories =
        updatedFields.calorie_goal !== undefined
          ? Number(updatedFields.calorie_goal)
          : (protein * 4 + carbs * 4 + fat * 9);

      const payload = {
        calorie_goal: calories,
        protein_goal: protein,
        carbs_goal: carbs,
        fat_goal: fat,
        goal_source: updatedFields.goal_source || "manual"
      };

      const data = await updateGoals(payload);

      setGoal(data);

      // 🔥 refresh everything
      loadData();

    } catch (err) {
      console.error("Goal update error:", err.message);
    }
  };

  /* ================= FILTER (FIXED TIMEZONE BUG) ================= */

  const filteredHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    const now = new Date();

    return history.filter((meal) => {
      if (!meal?.created_at) return false;

      const mealDate = new Date(meal.created_at);

      // ✅ LOCAL DATE (FIXES WRONG TOTAL ISSUE)
      const isSameDay =
        mealDate.getDate() === now.getDate() &&
        mealDate.getMonth() === now.getMonth() &&
        mealDate.getFullYear() === now.getFullYear();

      if (viewMode === "daily") return isSameDay;

      if (viewMode === "weekly") {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);

        return mealDate >= startOfWeek;
      }

      if (viewMode === "monthly") {
        return (
          mealDate.getMonth() === now.getMonth() &&
          mealDate.getFullYear() === now.getFullYear()
        );
      }

      return true;
    });
  }, [history, viewMode]);

  /* ================= TOTALS ================= */

  const totals = useMemo(() => {
    return filteredHistory.reduce(
      (acc, meal) => {
        acc.calories += Number(meal.calories || 0);
        acc.protein += Number(meal.protein || 0);
        acc.carbs += Number(meal.carbs || 0);
        acc.fat += Number(meal.fat || 0);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    );
  }, [filteredHistory]);

  /* ================= MACRO % ================= */

  const macroPercentages = useMemo(() => {
    const totalMacroCalories =
      totals.protein * 4 + totals.carbs * 4 + totals.fat * 9;

    if (!totalMacroCalories)
      return { protein: 0, carbs: 0, fat: 0 };

    return {
      protein: Math.round((totals.protein * 4 / totalMacroCalories) * 100),
      carbs: Math.round((totals.carbs * 4 / totalMacroCalories) * 100),
      fat: Math.round((totals.fat * 9 / totalMacroCalories) * 100),
    };
  }, [totals]);

  /* ================= CATEGORY TOTALS ================= */

  const categoryTotals = useMemo(() => {
    const grouped = {};

    filteredHistory.forEach((meal) => {
      const cat = meal.category || "Other";
      if (!grouped[cat]) grouped[cat] = 0;
      grouped[cat] += Number(meal.calories || 0);
    });

    return grouped;
  }, [filteredHistory]);

  /* ================= GOAL PROGRESS ================= */

  const progress = useMemo(() => {
    if (!goal) return null;

    return {
      calories:
        goal.calorie_goal > 0
          ? Math.min((totals.calories / goal.calorie_goal) * 100, 100)
          : 0,
      protein:
        goal.protein_goal > 0
          ? Math.min((totals.protein / goal.protein_goal) * 100, 100)
          : 0,
      carbs:
        goal.carbs_goal > 0
          ? Math.min((totals.carbs / goal.carbs_goal) * 100, 100)
          : 0,
      fat:
        goal.fat_goal > 0
          ? Math.min((totals.fat / goal.fat_goal) * 100, 100)
          : 0,
    };
  }, [totals, goal]);

  return (
    <AppContext.Provider
      value={{
        history,
        filteredHistory,
        goalHistory,
        addMeal,
        deleteMeal,
        loading,
        viewMode,
        setViewMode,
        totals,
        goal,
        updateGoal,
        progress,
        macroPercentages,
        categoryTotals,
        reloadData: loadData,
        setAuthToken
      }}
    >
      {children}
    </AppContext.Provider>
  );
};