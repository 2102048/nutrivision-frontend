// 🔹 Get meals between date range
export const getMealsByRange = (history, startDate, endDate) => {
  return history.filter((meal) => {
    const mealDate = new Date(meal.createdAt);
    return mealDate >= startDate && mealDate <= endDate;
  });
};

// 🔹 Calculate totals for given meals
export const calculateTotals = (meals) => {
  return meals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0 }
  );
};

// 🔹 Get today's range
export const getTodayRange = () => {
  const today = new Date();
  const start = new Date(today.setHours(0, 0, 0, 0));
  const end = new Date(today.setHours(23, 59, 59, 999));
  return { start, end };
};

// 🔹 Get current week's range (Monday–Sunday)
export const getWeekRange = () => {
  const today = new Date();
  const day = today.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? -6 : 1 - day;

  const start = new Date(today);
  start.setDate(today.getDate() + diffToMonday);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

// 🔹 Get selectable month range
export const getMonthRange = (month, year) => {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};
