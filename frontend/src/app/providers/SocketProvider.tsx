import React, { createContext, useContext, useEffect, useState } from "react";
import { socketManager, type SocketStatus } from "@/core/socket/client";
import { ENV } from "@/core/config/env";
import { mockGpsStreamer } from "@/mocks/services/mockGpsStreamer";

interface SocketContextValue {
  status: SocketStatus;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  status: "DISCONNECTED",
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [status, setStatus] = useState<SocketStatus>("CONNECTED");

  useEffect(() => {
    // 1. Kích hoạt GPS Streamer để bản đồ GPS và telemetry luôn có vệt chạy mượt mà
    const stopStreamer = mockGpsStreamer.start(2000);

    // 2. Nếu ở chế độ Backend thật, kiểm tra kết nối API qua endpoint /health
    let timerId: any;
    if (!ENV.USE_MOCK) {
      const checkBackendHealth = async () => {
        try {
          const res = await fetch(`${ENV.API_BASE_URL}/health`, { method: "GET" });
          if (res.ok) {
            setStatus("CONNECTED");
          } else {
            setStatus("DISCONNECTED");
          }
        } catch {
          setStatus("DISCONNECTED");
        }
      };

      checkBackendHealth();
      timerId = setInterval(checkBackendHealth, 8000);
    } else {
      setStatus("CONNECTED");
    }

    return () => {
      stopStreamer();
      if (timerId) clearInterval(timerId);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ status, isConnected: status === "CONNECTED" }}>
      {children}
    </SocketContext.Provider>
  );
};
