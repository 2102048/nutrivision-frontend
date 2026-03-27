import { useEffect, useRef } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export const useSmartNotifications = (token) => {
  const hasRunToday = useRef(false);

  useEffect(() => {
    if (!token) return;

    const runSmartCheck = async () => {
      try {
        // ✅ Only run when tab is active
        if (document.visibilityState !== "visible") return;

        // ✅ Check if already triggered today (localStorage persistence)
        const today = new Date().toISOString().split("T")[0];
        const lastRun = localStorage.getItem("lastNotificationCheck");

        if (lastRun === today) return;

        // ✅ Call backend ONLY ONCE PER DAY
        await axios.post(
          `${API}/notifications/trigger-check`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // ✅ Save run date
        localStorage.setItem("lastNotificationCheck", today);
        hasRunToday.current = true;

      } catch (err) {
        console.log("Notification trigger error", err);
      }
    };

    runSmartCheck();

    // 👇 Optional: re-check when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        runSmartCheck();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token]);
};