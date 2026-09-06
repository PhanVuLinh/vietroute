import { useEffect, useState } from "react";
import { socketManager, type SocketStatus, type SocketServerEvents } from "@/core/socket/client";

/**
 * Hook quản lý kết nối và lắng nghe sự kiện Realtime từ Socket.IO
 */
export function useSocket() {
  const [status, setStatus] = useState<SocketStatus>(socketManager.getStatus());

  useEffect(() => {
    socketManager.connect();
    const cleanup = socketManager.onStatusChange(setStatus);
    return cleanup;
  }, []);

  /**
   * Đăng ký lắng nghe 1 sự kiện cụ thể có cleanup tự động
   */
  const useEventListener = <K extends keyof SocketServerEvents>(
    event: K,
    handler: SocketServerEvents[K]
  ) => {
    useEffect(() => {
      const cleanup = socketManager.on(event, handler);
      return cleanup;
    }, [event, handler]);
  };

  return {
    status,
    isConnected: status === "CONNECTED",
    socket: socketManager.getSocket(),
    useEventListener,
    disconnect: () => socketManager.disconnect(),
    connect: () => socketManager.connect(),
  };
}
