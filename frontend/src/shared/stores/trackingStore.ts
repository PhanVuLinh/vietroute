import { create } from "zustand";
import type { VehicleTelemetry } from "@/core/types/logistics";

interface TrackingState {
  /**
   * Lưu trữ tọa độ theo Dictionary <vehicleId, VehicleTelemetry>
   * Cho phép tra cứu và cập nhật O(1) mà không render lại toàn bộ danh sách
   */
  vehicles: Record<string, VehicleTelemetry>;

  /** ID phương tiện đang được người dùng chọn xem chi tiết */
  selectedVehicleId: string | null;

  /** Cập nhật telemetry cho 1 xe từ socket event */
  updateVehicleTelemetry: (telemetry: VehicleTelemetry) => void;

  /** Cập nhật hàng loạt (batch update) tránh gián đoạn FPS */
  batchUpdateTelemetry: (list: VehicleTelemetry[]) => void;

  /** Chọn hoặc bỏ chọn phương tiện trên bản đồ */
  setSelectedVehicleId: (id: string | null) => void;

  /** Xóa toàn bộ dữ liệu khi rời trung tâm giám sát */
  resetTracking: () => void;
}

export const useTrackingStore = create<TrackingState>()((set) => ({
  vehicles: {},
  selectedVehicleId: null,

  updateVehicleTelemetry: (telemetry) =>
    set((state) => ({
      vehicles: {
        ...state.vehicles,
        [telemetry.vehicleId]: telemetry,
      },
    })),

  batchUpdateTelemetry: (list) =>
    set((state) => {
      const nextVehicles = { ...state.vehicles };
      for (const item of list) {
        nextVehicles[item.vehicleId] = item;
      }
      return { vehicles: nextVehicles };
    }),

  setSelectedVehicleId: (id) => set({ selectedVehicleId: id }),

  resetTracking: () => set({ vehicles: {}, selectedVehicleId: null }),
}));

/**
 * Trình truy xuất trực tiếp (non-reactive getter)
 * Bản đồ MapLibre GL có thể đọc trực tiếp GeoJSON source mà không gây re-render React component
 */
export function getVehiclesSnapshot(): Record<string, VehicleTelemetry> {
  return useTrackingStore.getState().vehicles;
}
