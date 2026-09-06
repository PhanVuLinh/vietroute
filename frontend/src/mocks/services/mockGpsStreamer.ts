import { useTrackingStore } from "@/shared/stores/trackingStore";
import { MOCK_DRIVERS } from "../data/drivers";
import { MOCK_VEHICLES } from "../data/vehicles";
import type { VehicleTelemetry } from "@/core/types/logistics";

class MockGpsStreamer {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isStreaming = false;

  // Trạng thái tọa độ và góc quay nội bộ của 6 tài xế đang chạy tuyến
  private activeSimulations = [
    { driverId: "drv-01", vehicleId: "veh-01", coords: [105.8544, 21.0285] as [number, number], bearing: 45, speed: 42, deltaLat: 0.0003, deltaLng: 0.0002 },
    { driverId: "drv-03", vehicleId: "veh-03", coords: [105.7981, 21.0333] as [number, number], bearing: 90, speed: 38, deltaLat: 0.0001, deltaLng: 0.0003 },
    { driverId: "drv-05", vehicleId: "veh-05", coords: [106.6297, 10.8231] as [number, number], bearing: 180, speed: 55, deltaLat: -0.0002, deltaLng: 0.0002 },
    { driverId: "drv-09", vehicleId: "veh-09", coords: [108.2022, 16.0544] as [number, number], bearing: 270, speed: 48, deltaLat: 0.0002, deltaLng: -0.0002 },
    { driverId: "drv-12", vehicleId: "veh-12", coords: [108.8045, 15.1205] as [number, number], bearing: 135, speed: 50, deltaLat: 0.0003, deltaLng: 0.0001 },
    { driverId: "drv-14", vehicleId: "veh-14", coords: [105.7725, 10.0354] as [number, number], bearing: 60, speed: 44, deltaLat: -0.0001, deltaLng: 0.0003 },
  ];

  /**
   * Bắt đầu phát luồng tọa độ GPS giả lập mỗi 2 giây
   * Cập nhật trực tiếp vào trackingStore (Zustand)
   */
  public start(intervalMs: number = 2000): () => void {
    if (this.isStreaming) {
      return () => this.stop();
    }

    this.isStreaming = true;

    // Phát nhịp đầu tiên ngay lập tức
    this.tick();

    this.timerId = setInterval(() => {
      this.tick();
    }, intervalMs);

    return () => this.stop();
  }

  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isStreaming = false;
  }

  private tick(): void {
    const updates: VehicleTelemetry[] = [];
    const now = new Date().toISOString();

    for (const sim of this.activeSimulations) {
      // Cập nhật tọa độ di chuyển nhẹ
      sim.coords[0] += sim.deltaLng;
      sim.coords[1] += sim.deltaLat;

      // Xoay hướng ngẫu nhiên nhẹ để xe di chuyển tự nhiên
      sim.bearing = (sim.bearing + (Math.random() * 10 - 5) + 360) % 360;
      sim.speed = Math.max(25, Math.min(65, sim.speed + (Math.random() * 6 - 3)));

      const driver = MOCK_DRIVERS.find((d) => d.id === sim.driverId);
      const vehicle = MOCK_VEHICLES.find((v) => v.id === sim.vehicleId);

      updates.push({
        vehicleId: sim.vehicleId,
        driverId: sim.driverId,
        driverName: driver?.fullName || "Tài xế VietRoute",
        plateNumber: vehicle?.licensePlate || "29C-000.00",
        coordinates: [sim.coords[0], sim.coords[1]],
        bearing: Math.round(sim.bearing),
        speedKmH: Math.round(sim.speed),
        fuelPercent: vehicle?.fuelPercent || 80,
        updatedAt: now,
      });
    }

    // Cập nhật batch vào Zustand trackingStore mà không gây re-render các UI component không liên quan
    useTrackingStore.getState().batchUpdateTelemetry(updates);
  }
}

export const mockGpsStreamer = new MockGpsStreamer();
