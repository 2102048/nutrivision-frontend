import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { useSmartNotifications } from "./hooks/useSmartNotifications";
import { Toaster } from "react-hot-toast";

import DashboardLayout from "./layouts/DashboardLayout";

import AIAssistant from "./pages/AIAssistant/AIAssistant";
import Dashboard from "./pages/Dashboard/Dashboard";
import ScanFood from "./pages/ScanFood/ScanFood";
import History from "./pages/History/History";
import Profile from "./pages/Profile/Profile";
import BMI from "./pages/Dashboard/BMI";

import ResetPassword from "./pages/Auth/ResetPassword";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";

import ProtectedRoute from "./utils/ProtectedRoute";

import { useEffect } from "react";
import { requestPermission } from "./firebase";
import axios from "axios";

function App() {
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) return;

    const setupNotifications = async () => {
      try {
        const fcmToken = await requestPermission();
        if (!fcmToken) return;

        const savedToken = localStorage.getItem("fcmToken");

        // ✅ avoid duplicate save
        if (savedToken === fcmToken) return;

        await axios.post(
          "http://localhost:8000/notifications/save-token",
          { token: fcmToken },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        localStorage.setItem("fcmToken", fcmToken);

      } catch (err) {
        console.log("❌ Token save failed", err);
      }
    };

    // ✅ FIX: defer execution (prevents React warning)
    const timeout = setTimeout(() => {
      setupNotifications();
    }, 0);

    return () => clearTimeout(timeout);

  }, [token]);

  return (
    <AppProvider>
      {/* 🔥 Toast UI */}
      <Toaster position="top-right" />

      <InnerApp token={token} />
    </AppProvider>
  );
}

function InnerApp({ token }) {
  useSmartNotifications(token);

  return (
    <BrowserRouter>
      <Routes>

        {/* 🔓 PUBLIC ROUTES */}
        <Route
          path="/login"
          element={token ? <Navigate to="/dashboard" replace /> : <Login />}
        />

        <Route
          path="/register"
          element={token ? <Navigate to="/dashboard" replace /> : <Register />}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* 🔒 PROTECTED ROUTES */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/scan" element={<ScanFood />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/bmi" element={<BMI />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
        </Route>

        {/* DEFAULT */}
        <Route
          path="/"
          element={
            token
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/login" replace />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;