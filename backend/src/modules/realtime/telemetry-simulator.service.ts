import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { RealtimeGateway, VehicleTelemetryPayload } from './realtime.gateway.js';

interface SimulatedVehicleState {
  vehicleId: string;
  plateNumber: string;
  driverId?: string;
  driverName?: string;
  currentLat: number;
  currentLng: number;
  speed: number;
  heading: number;
  fuelLevel: number;
  batteryLevel: number;
  waypoints: [number, number][]; // [lat, lng]
  currentWaypointIndex: number;
  direction: 1 | -1;
}

@Injectable()
export class TelemetrySimulatorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('TelemetrySimulator');
  private intervalHandle: NodeJS.Timeout | null = null;
  private isRunning = false;
  private simulatedVehicles: Map<string, SimulatedVehicleState> = new Map();

  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: RealtimeGateway,
  ) {}

  async onModuleInit() {
    // Khởi tạo và nạp dữ liệu xe thực tế từ PostgreSQL
    await this.initVehiclesFromDb();
    // Bắt đầu mô phỏng GPS tự động
    this.startSimulation();
  }

  onModuleDestroy() {
    this.stopSimulation();
  }

  /**
   * Đọc danh sách phương tiện và tài xế thật từ Database PostgreSQL
   */
  async initVehiclesFromDb() {
    try {
      const vehicles = await this.prisma.vehicle.findMany({
        include: {
          driver: true,
        },
      });

      this.logger.log(`🚗 Nạp ${vehicles.length} phương tiện từ PostgreSQL vào bộ mô phỏng GPS...`);

      // Định nghĩa các cung đường thực tế tại Hà Nội, Hải Phòng, Đà Nẵng, TP.HCM
      const sampleRoutes: [number, number][][] = [
        // Tuyến 1: Vành đai 3 Hà Nội (Kho Long Biên -> Mỹ Đình -> Hà Đông)
        [
          [21.0345, 105.8921], // Long Biên
          [21.0285, 105.8544], // Hoàn Kiếm
          [21.0125, 105.8201], // Đống Đa
          [21.0227, 105.7766], // Mỹ Đình
          [20.9782, 105.7778], // Hà Đông
          [20.9856, 105.8452], // Hoàng Mai
          [21.0345, 105.8921], // Về lại Long Biên
        ],
        // Tuyến 2: Hà Nội - Bắc Ninh (QL1A)
        [
          [21.0450, 105.8820], // Gia Lâm
          [21.0850, 105.9320], // Yên Viên
          [21.1200, 105.9800], // Từ Sơn
          [21.1861, 106.0763], // TP Bắc Ninh
          [21.1200, 105.9800],
          [21.0450, 105.8820],
        ],
        // Tuyến 3: TP.HCM (Kho Tân Bình -> Cát Lái -> Thủ Đức)
        [
          [10.8015, 106.6543], // Tân Bình
          [10.7769, 106.7009], // Quận 1
          [10.7580, 106.7580], // Cát Lái
          [10.8500, 106.7720], // Thủ Đức
          [10.8200, 106.6800], // Gò Vấp
          [10.8015, 106.6543],
        ],
        // Tuyến 4: Đà Nẵng (Hải Châu -> Cẩm Lệ -> KCN Hòa Khánh)
        [
          [16.0682, 108.2198], // Hải Châu
          [16.0250, 108.2000], // Cẩm Lệ
          [16.0720, 108.1500], // Hòa Khánh
          [16.0682, 108.2198],
        ],
      ];

      vehicles.forEach((veh, index) => {
        const route = sampleRoutes[index % sampleRoutes.length];
        const initialLat = veh.driver?.current_location_lat || route[0][0];
        const initialLng = veh.driver?.current_location_lng || route[0][1];

        this.simulatedVehicles.set(veh.id, {
          vehicleId: veh.id,
          plateNumber: veh.license_plate,
          driverId: veh.driver?.id,
          driverName: veh.driver?.full_name,
          currentLat: initialLat,
          currentLng: initialLng,
          speed: Math.floor(Math.random() * 25) + 35, // 35 - 60 km/h
          heading: Math.floor(Math.random() * 360),
          fuelLevel: veh.fuel_percent || 85,
          batteryLevel: 95,
          waypoints: route,
          currentWaypointIndex: index % route.length,
          direction: 1,
        });
      });

      this.logger.log(`✅ Khởi tạo thành công ${this.simulatedVehicles.size} xe chạy live GPS.`);
    } catch (err) {
      this.logger.error(`Lỗi khi nạp dữ liệu xe: ${(err as any)?.message}`);
    }
  }

  /**
   * Bắt đầu vòng lặp phát sóng telemetry GPS
   */
  startSimulation(intervalMs: number = 2500) {
    if (this.isRunning) return;
    this.isRunning = true;

    this.logger.log(`🛰️ Bắt đầu phát sóng GPS thời gian thực (chu kỳ ${intervalMs}ms)...`);

    this.intervalHandle = setInterval(() => {
      this.tick();
    }, intervalMs);
  }

  stopSimulation() {
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle);
      this.intervalHandle = null;
    }
    this.isRunning = false;
    this.logger.log('🛑 Đã tạm dừng phát sóng GPS.');
  }

  toggleSimulation(): boolean {
    if (this.isRunning) {
      this.stopSimulation();
      return false;
    } else {
      this.startSimulation();
      return true;
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      activeVehiclesCount: this.simulatedVehicles.size,
      connectedSocketsCount: this.gateway.getConnectedCount(),
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Bước tính toán di chuyển tiếp theo cho tất cả các xe
   */
  private tick() {
    if (this.simulatedVehicles.size === 0) return;

    this.simulatedVehicles.forEach((veh) => {
      const targetWaypoint = veh.waypoints[veh.currentWaypointIndex];

      // Tính khoảng cách tới target waypoint
      const dLat = targetWaypoint[0] - veh.currentLat;
      const dLng = targetWaypoint[1] - veh.currentLng;
      const distance = Math.sqrt(dLat * dLat + dLng * dLng);

      // Nếu đã rất gần waypoint đích, chuyển sang waypoint kế tiếp
      if (distance < 0.002) {
        veh.currentWaypointIndex += veh.direction;
        if (veh.currentWaypointIndex >= veh.waypoints.length) {
          veh.currentWaypointIndex = veh.waypoints.length - 2;
          veh.direction = -1;
        } else if (veh.currentWaypointIndex < 0) {
          veh.currentWaypointIndex = 1;
          veh.direction = 1;
        }
      }

      // Bước nhảy tọa độ (Step size dựa trên tốc độ và jitter thực tế)
      const stepFactor = 0.00045; // ~50m mỗi 2.5s (~70km/h)
      const nextTarget = veh.waypoints[veh.currentWaypointIndex];
      const targetAngle = Math.atan2(
        nextTarget[1] - veh.currentLng,
        nextTarget[0] - veh.currentLat,
      );

      // Cập nhật tọa độ mới
      veh.currentLat += Math.cos(targetAngle) * stepFactor;
      veh.currentLng += Math.sin(targetAngle) * stepFactor;

      // Tính góc quay la bàn (Heading 0-360 độ)
      let headingDeg = Math.round((targetAngle * 180) / Math.PI);
      if (headingDeg < 0) headingDeg += 360;
      veh.heading = headingDeg;

      // Biến thiên tốc độ thực tế
      veh.speed = Math.max(20, Math.min(80, veh.speed + (Math.random() * 6 - 3)));

      // Tiêu hao nhiên liệu vi mô
      veh.fuelLevel = Math.max(10, +(veh.fuelLevel - 0.005).toFixed(2));

      // Tạo payload chuẩn
      const payload: VehicleTelemetryPayload = {
        vehicleId: veh.vehicleId,
        plateNumber: veh.plateNumber,
        driverId: veh.driverId,
        driverName: veh.driverName,
        latitude: +veh.currentLat.toFixed(6),
        longitude: +veh.currentLng.toFixed(6),
        speed: Math.round(veh.speed),
        heading: veh.heading,
        fuelLevel: veh.fuelLevel,
        batteryLevel: veh.batteryLevel,
        engineStatus: veh.speed > 5 ? 'RUNNING' : 'IDLE',
        timestamp: new Date().toISOString(),
      };

      // Phát qua WebSocket Gateway
      this.gateway.emitTelemetryUpdate(payload);
    });
  }
}
