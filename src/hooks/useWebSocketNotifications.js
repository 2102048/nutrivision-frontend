import { useEffect, useRef } from "react";
import toast from "react-hot-toast";

export const useWebSocketNotifications = (onNewNotification, enabled = true) => {
  const wsRef = useRef(null);

  useEffect(() => {
    if (!enabled) return; // 🔥 STOP if notifications OFF

    let ws;

    const connect = () => {
      ws = new WebSocket("ws://localhost:8000/notifications/ws");
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected");
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        console.log("🔥 New notification:", data);

        // ✅ show toast ONLY if enabled
        if (enabled) {
          toast.success(data.message);
        }

        // ✅ update UI
        if (onNewNotification) {
          onNewNotification(data);
        }
      };

      ws.onclose = () => {
        console.log("❌ WebSocket disconnected → reconnecting...");

        // 🔥 AUTO RECONNECT
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [onNewNotification, enabled]);
};