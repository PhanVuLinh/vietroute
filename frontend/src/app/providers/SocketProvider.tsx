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
  const [status, setStatus] = useState<SocketStatus>(() =>
    ENV.USE_MOCK ? "CONNECTED" : socketManager.getStatus()
  );

  useEffect(() => {
    if (ENV.USE_MOCK) {
      const stopStreamer = mockGpsStreamer.start(2000);
      return () => {
        stopStreamer();
      };
    }

    socketManager.connect();
    const cleanup = socketManager.onStatusChange(setStatus);

    return () => {
      cleanup();
      socketManager.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ status, isConnected: status === "CONNECTED" }}>
      {children}
    </SocketContext.Provider>
  );
};
