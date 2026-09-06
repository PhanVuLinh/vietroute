import { io, type Socket } from "socket.io-client";
import { ENV } from "@/core/config/env";
import { getStoredToken } from "@/core/http/client";
import type { VehicleTelemetry } from "@/core/types/logistics";

export type SocketStatus = "DISCONNECTED" | "CONNECTING" | "CONNECTED" | "ERROR";

export interface SocketServerEvents {
  "telemetry:update": (data: VehicleTelemetry) => void;
  "order:status_changed": (data: { orderId: string; status: string; updatedAt: string }) => void;
  "alert:emergency": (data: { id: string; title: string; message: string; severity: "HIGH" | "MEDIUM" | "LOW" }) => void;
}

class SocketManager {
  private socket: Socket | null = null;
  private status: SocketStatus = "DISCONNECTED";
  private statusListeners: Set<(status: SocketStatus) => void> = new Set();

  /**
   * Kết nối tới máy chủ Socket.IO Realtime
   */
  public connect(): Socket {
    if (this.socket && (this.socket.connected || this.status === "CONNECTING")) {
      return this.socket;
    }

    this.setStatus("CONNECTING");
    const token = getStoredToken();

    this.socket = io(ENV.SOCKET_URL, {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
      auth: {
        token: token ? `Bearer ${token}` : "",
      },
      transports: ["websocket", "polling"],
    });

    this.socket.on("connect", () => {
      this.setStatus("CONNECTED");
    });

    this.socket.on("disconnect", () => {
      this.setStatus("DISCONNECTED");
    });

    this.socket.on("connect_error", () => {
      this.setStatus("ERROR");
    });

    return this.socket;
  }

  /**
   * Ngắt kết nối socket khi đăng xuất hoặc rời màn hình
   */
  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.setStatus("DISCONNECTED");
    }
  }

  /**
   * Đăng ký lắng nghe sự kiện từ máy chủ
   * @returns Hàm hủy đăng ký (cleanup)
   */
  public on<K extends keyof SocketServerEvents>(
    event: K,
    listener: SocketServerEvents[K]
  ): () => void {
    const s = this.socket || this.connect();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    s.on(event, listener as any);

    return () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.off(event, listener as any);
    };
  }

  /**
   * Đăng ký lắng nghe trạng thái kết nối socket
   */
  public onStatusChange(listener: (status: SocketStatus) => void): () => void {
    this.statusListeners.add(listener);
    listener(this.status);
    return () => {
      this.statusListeners.delete(listener);
    };
  }

  public getStatus(): SocketStatus {
    return this.status;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  private setStatus(newStatus: SocketStatus): void {
    this.status = newStatus;
    this.statusListeners.forEach((listener) => listener(newStatus));
  }
}

export const socketManager = new SocketManager();
