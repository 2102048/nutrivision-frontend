import { useEffect, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = "http://localhost:8000";

export const useNotifications = (token) => {
  const [notifications, setNotifications] = useState([]);
  const shownIds = useRef(new Set());

  const playSound = () => {
    const audio = new Audio("/notification.mp3");
    audio.play().catch(() => {});
  };

  useEffect(() => {
    if (!token) return;

    const fetchInitial = async () => {
      try {
        const res = await axios.get(`${API}/notifications/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = res.data || [];

        // show toast only once
        data.forEach((n) => {
          if (!n.is_read && !shownIds.current.has(n.id)) {
            toast(n.message);
            playSound();
            shownIds.current.add(n.id);
          }
        });

        setNotifications(data);
      } catch (err) {
        console.log("❌ Fetch error:", err);
      }
    };

    fetchInitial();
  }, [token]);

  return { notifications, setNotifications };
};