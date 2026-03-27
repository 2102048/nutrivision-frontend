import { getToken } from "firebase/messaging";
import { messaging } from "../firebase";
import axios from "axios";

const API = "http://localhost:8000";

export const initNotifications = async (token) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") return;

    const fcmToken = await getToken(messaging, {
      vapidKey: "YOUR_VAPID_KEY",
    });

    if (!fcmToken) return;

    // ✅ SEND TO BACKEND
    await axios.post(
      `${API}/notifications/save-token`,
      { token: fcmToken },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

  } catch (err) {
    console.log("FCM error", err);
  }
};