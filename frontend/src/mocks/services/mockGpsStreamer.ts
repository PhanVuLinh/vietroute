import { useTrackingStore } from "@/shared/stores/trackingStore";
import { MOCK_DRIVERS } from "../data/drivers";
import { MOCK_VEHICLES } from "../data/vehicles";
import type { VehicleTelemetry } from "@/core/types/logistics";

interface VehicleSimulationState {
  driverId: string;
  vehicleId: string;
  coords: [number, number];
  bearing: number;
  speed: number;
  deltaLat: number;
  deltaLng: number;
  isMoving: boolean;
}

class MockGpsStreamer {
  private timerId: ReturnType<typeof setInterval> | null = null;
  private isStreaming = false;
  private speedMultiplier: number = 1;
  private currentIntervalMs: number = 2000;

  // Danh sách mô phỏng cho các xe trong hệ thống
  private simulations: VehicleSimulationState[] = [
    // Hà Nội
    { driverId: "drv-01", vehicleId: "veh-01", coords: [105.8544, 21.0285], bearing: 45, speed: 42, deltaLat: 0.0003, deltaLng: 0.0002, isMoving: true },
    { driverId: "drv-02", vehicleId: "veh-02", coords: [105.9082, 21.0368], bearing: 0, speed: 0, deltaLat: 0, deltaLng: 0, isMoving: false },
    { driverId: "drv-03", vehicleId: "veh-03", coords: [105.7981, 21.0333], bearing: 90, speed: 38, deltaLat: 0.0001, deltaLng: 0.0003, isMoving: true },
    { driverId: "drv-04", vehicleId: "veh-04", coords: [105.7845, 21.0382], bearing: 180, speed: 0, deltaLat: 0, deltaLng: 0, isMoving: false },
    
    // TP.HCM
    { driverId: "drv-05", vehicleId: "veh-05", coords: [106.6297, 10.8231], bearing: 180, speed: 55, deltaLat: -0.0002, deltaLng: 0.0002, isMoving: true },
    { driverId: "drv-06", vehicleId: "veh-06", coords: [106.6214, 10.8172], bearing: 0, speed: 0, deltaLat: 0, deltaLng: 0, isMoving: false },
    { driverId: "drv-07", vehicleId: "veh-07", coords: [106.7794, 10.7639], bearing: 240, speed: 32, deltaLat: -0.0001, deltaLng: -0.0002, isMoving: true },
    
    // Đà Nẵng & Miền Trung
    { driverId: "drv-09", vehicleId: "veh-09", coords: [108.2022, 16.0544], bearing: 270, speed: 48, deltaLat: 0.0002, deltaLng: -0.0002, isMoving: true },
    { driverId: "drv-10", vehicleId: "veh-10", coords: [108.2208, 16.0678], bearing: 0, speed: 0, deltaLat: 0, deltaLng: 0, isMoving: false },
    { driverId: "drv-12", vehicleId: "veh-12", coords: [108.8045, 15.1205], bearing: 135, speed: 52, deltaLat: 0.0003, deltaLng: 0.0001, isMoving: true },
    
    // Cần Thơ & Miền Tây
    { driverId: "drv-14", vehicleId: "veh-14", coords: [105.7725, 10.0354], bearing: 60, speed: 44, deltaLat: -0.0001, deltaLng: 0.0003, isMoving: true },
  ];

  /** Bắt đầu stream */
  public start(intervalMs: number = 2000): () => void {
    this.currentIntervalMs = intervalMs;
    if (this.isStreaming) {
      return () => this.stop();
    }

    this.isStreaming = true;
    this.tick();

    this.timerId = setInterval(() => {
      this.tick();
    }, Math.max(200, Math.round(this.currentIntervalMs / this.speedMultiplier)));

    return () => this.stop();
  }

  /** Dừng stream */
  public stop(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isStreaming = false;
  }

  /** Kiểm tra trạng thái đang stream */
  public getIsStreaming(): boolean {
    return this.isStreaming;
  }

  /** Điều chỉnh tốc độ mô phỏng (1x, 2x, 5x) */
  public setSpeed(multiplier: number): void {
    this.speedMultiplier = multiplier;
    if (this.isStreaming) {
      this.stop();
      this.start(this.currentIntervalMs);
    }
  }

  public getSpeed(): number {
    return this.speedMultiplier;
  }

  /** Thực hiện 1 nhịp phát dữ liệu GPS */
  private tick(): void {
    const updates: VehicleTelemetry[] = [];
    const now = new Date().toISOString();

    for (const sim of this.simulations) {
      if (sim.isMoving) {
        // Cập nhật tọa độ di chuyển
        sim.coords[0] += sim.deltaLng * this.speedMultiplier;
        sim.coords[1] += sim.deltaLat * this.speedMultiplier;

        // Giới hạn biên độ di chuyển quanh thành phố
        if (Math.abs(sim.coords[0]) > 180 || Math.abs(sim.coords[1]) > 90) {
          sim.deltaLat = -sim.deltaLat;
          sim.deltaLng = -sim.deltaLng;
        }

        // Xoay nhẹ góc lái
        sim.bearing = (sim.bearing + (Math.random() * 8 - 4) + 360) % 360;
        sim.speed = Math.max(20, Math.min(68, sim.speed + (Math.random() * 6 - 3)));
      }

      const driver = MOCK_DRIVERS.find((d) => d.id === sim.driverId);
      const vehicle = MOCK_VEHICLES.find((v) => v.id === sim.vehicleId);

      updates.push({
        vehicleId: sim.vehicleId,
        driverId: sim.driverId,
        driverName: driver?.fullName || "Tài xế VietRoute",
        plateNumber: vehicle?.licensePlate || "29C-000.00",
        coordinates: [sim.coords[0], sim.coords[1]],
        bearing: Math.round(sim.bearing),
        speedKmH: sim.isMoving ? Math.round(sim.speed) : 0,
        fuelPercent: vehicle?.fuelPercent || 80,
        updatedAt: now,
      });
    }

    useTrackingStore.getState().batchUpdateTelemetry(updates);
  }
}

export const mockGpsStreamer = new MockGpsStreamer();
