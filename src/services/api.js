const BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// ==========================
// 🔐 TOKEN HANDLING (STABLE NAMES)
// ==========================

export const getToken = () => localStorage.getItem("access_token");

export const setToken = (access) => {
  localStorage.setItem("access_token", access);
};

export const removeToken = () => {
  localStorage.removeItem("access_token");
};

// ==========================
// 🚀 GENERIC REQUEST WRAPPER
// ==========================

const request = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    ...options,
    headers: {
      ...(options.headers || {}),
    },
  };

  // ✅ Attach token to every request
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  // ✅ Handle Unauthorized properly (NO refresh logic)
  if (response.status === 401) {
    console.log("Unauthorized - logging out");

    removeToken();
    window.location.href = "/login";
    return;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Something went wrong");
  }

  return data;
};

// ==========================
// 👤 AUTH APIs
// ==========================

export const loginUser = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);

  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.detail || "Login failed");
  }

  // ✅ Store ONLY access token (no refresh token)
  setToken(data.access_token);

  return data;
};

export const registerUser = (name, email, password) =>
  request("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });

// ==========================
// 🍽 MEALS
// ==========================

export const addMeal = (mealData) =>
  request("/meals/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(mealData),
  });

export const getMeals = async () => {
  const data = await request("/meals/");
  return data;
};

export const deleteMeal = (id) =>
  request(`/meals/${id}`, { method: "DELETE" });

// ==========================
// 🎯 GOALS
// ==========================

export const getGoals = () => request("/goals/");

export const updateGoals = (goalData) =>
  request("/goals/", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(goalData),
  });

export const getGoalHistory = () => request("/goals/history");

// ==========================
// 👤 PROFILE & HEALTH
// ==========================

export const getProfile = () => request("/profile/");

export const updateName = (name) => {
  const payload = typeof name === "string" ? { name } : name;
  return request("/profile/update-name", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
};

export const updateEmail = (email) =>
  request("/profile/update-email", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

export const getHealth = () => request("/profile/health");

export const updateHealthInfo = (data) =>
  request("/profile/update-health", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

// ==========================
// ⚖️ BMI
// ==========================

export const calculateBMI = (data) =>
  request("/bmi/smart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getBMIHistory = () => request("/bmi/history");

// ==========================
// 📸 SCAN & AI
// ==========================

export const scanFoodImage = async (file) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${BASE_URL}/scan/`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Scan failed");
  }
  return await response.json();
};

export const getScannedNutrition = (food, quantity = 1, unit = "piece") => {
  const params = new URLSearchParams({ food, quantity, unit });
  return request(`/scan/nutrition?${params.toString()}`);
};

export const aiFoodLog = (message) =>
  request("/ai/food", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message }),
  });

// ==========================
// 🔐 SECURITY & LOGOUT
// ==========================

export const changePassword = (data) =>
  request("/profile/change-password", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const logoutUser = () => {
  removeToken();
  window.location.href = "/login";
};