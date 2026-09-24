import React, { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { socketManager, type SocketStatus, type TelemetryPayload } from "@/core/socket/client";
import { ENV } from "@/core/config/env";
import { mockGpsStreamer } from "@/mocks/services/mockGpsStreamer";
import { useTrackingStore } from "@/shared/stores/trackingStore";
import { toast } from "@/shared/components/feedback/Toast";
import type { VehicleTelemetry } from "@/core/types/logistics";

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
  const [status, setStatus] = useState<SocketStatus>("DISCONNECTED");
  const queryClient = useQueryClient();

  useEffect(() => {
    // 1. Chế độ Mock: Nếu bật USE_MOCK thì chạy streamer nội bộ
    if (ENV.USE_MOCK) {
      const stopStreamer = mockGpsStreamer.start(2000);
      setStatus("CONNECTED");
      return () => {
        stopStreamer();
      };
    }

    // 2. Chế độ Thật: Kết nối Socket.IO tới Backend
    const socket = socketManager.connect();

    // Lắng nghe thay đổi trạng thái kết nối
    const unbindStatus = socketManager.onStatusChange((newStatus) => {
      setStatus(newStatus);
    });

    // Sự kiện 1: GPS Telemetry Update từ máy chủ
    const unbindTelemetry = socketManager.on("telemetry:update", (data: TelemetryPayload) => {
      const telemetry: VehicleTelemetry = {
        vehicleId: data.vehicleId,
        driverId: data.driverId,
        driverName: data.driverName || "Tài xế VietRoute",
        plateNumber: data.plateNumber || "Xe VietRoute",
        coordinates: [data.longitude, data.latitude], // GeoJSON quy ước [Kinh độ, Vĩ độ]
        bearing: data.heading || 0,
        speedKmH: data.speed || 0,
        fuelPercent: data.fuelLevel ?? 80,
        updatedAt: data.timestamp || new Date().toISOString(),
      };

      // Ghi đè tọa độ thời gian thực vào store
      useTrackingStore.getState().updateVehicleTelemetry(telemetry);
    });

    // Sự kiện 2: Trạng thái đơn hàng thay đổi
    const unbindOrderStatus = socketManager.on("order:status_changed", (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });

      toast.info(
        `Đơn hàng #${data.orderCode || data.orderId.slice(-6)}`,
        data.message || `Cập nhật trạng thái mới: ${data.status}`
      );
    });

    // Sự kiện 3: Phát hiện sự cố mới khẩn cấp
    const unbindIncident = socketManager.on("incident:created", (data) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      toast.error(
        `⚠️ SỰ CỐ KHẨN CẤP [${data.severity}]`,
        `${data.title} - Mã: ${data.incidentCode}${data.driverName ? ` (Tài xế: ${data.driverName})` : ""}`
      );
    });

    // Sự kiện 4: Cảnh báo toàn hệ thống
    const unbindAlert = socketManager.on("alert:emergency", (data) => {
      queryClient.invalidateQueries({ queryKey: ["incidents"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });

      if (data.severity === "HIGH") {
        toast.error(`🚨 ${data.title}`, data.message);
      } else {
        toast.warning(`⚠️ ${data.title}`, data.message);
      }
    });

    // Sự kiện 5: Tài xế nộp tiền COD
    const unbindCod = socketManager.on("cod:submitted", (data) => {
      queryClient.invalidateQueries({ queryKey: ["finance"] });
      queryClient.invalidateQueries({ queryKey: ["cod"] });

      toast.success(
        "Nộp tiền COD thành công",
        `Tài xế ${data.driverName} đã nộp ${Number(data.submittedAmount).toLocaleString("vi-VN")} đ (Mã: ${data.reconciliationCode})`
      );
    });

    // Sự kiện 6: Thông báo cá nhân mới
    const unbindNotification = socketManager.on("notification:new", (notif) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      if (notif?.title) {
        toast.info(notif.title, notif.message);
      }
    });

    // Sự kiện 7: Handshake thành công
    const unbindAck = socketManager.on("connection:ack", (data) => {
      console.log("⚡ [VietRoute Realtime] Kết nối thành công tới máy chủ Gateway:", data);
    });

    return () => {
      unbindStatus();
      unbindTelemetry();
      unbindOrderStatus();
      unbindIncident();
      unbindAlert();
      unbindCod();
      unbindNotification();
      unbindAck();
      socketManager.disconnect();
    };
  }, [queryClient]);

  return (
    <SocketContext.Provider value={{ status, isConnected: status === "CONNECTED" }}>
      {children}
    </SocketContext.Provider>
  );
};
