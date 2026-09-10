/**
 * Tọa độ địa lý GPS [Kinh độ, Vĩ độ]
 */
export type GeoCoordinates = [number, number];

/**
 * Mức độ ưu tiên của đơn hàng
 */
export type OrderPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";

/**
 * Trạng thái của đơn hàng
 */
export type OrderStatus =
  | "PENDING"        // Chờ xử lý
  | "CONFIRMED"      // Đã tiếp nhận
  | "ASSIGNED"       // Đã phân công
  | "PICKING_UP"     // Đang lấy hàng
  | "IN_TRANSIT"     // Đang vận chuyển
  | "DELIVERED"      // Giao thành công
  | "FAILED"         // Giao thất bại
  | "CANCELLED";     // Đã hủy

/**
 * Chi tiết từng mặt hàng trong đơn hàng
 */
export interface OrderItem {
  id: string;
  orderId: string;
  productName: string;
  quantity: number;
  weight: number; // kg
  volume: number; // m³
  isFragile: boolean; // Hàng dễ vỡ
  isLiquid: boolean; // Chất lỏng
  requiresSpecialHandling: boolean; // Yêu cầu bảo quản đặc biệt (lạnh, giá trị cao)
}

/**
 * Khách hàng cá nhân hoặc doanh nghiệp
 */
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  latitude: number;
  longitude: number;
  type: "INDIVIDUAL" | "ENTERPRISE";
}

/**
 * Đơn hàng vận chuyển
 */
export interface Order {
  id: string;
  orderCode: string;
  customerId: string;
  warehouseId: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  receiverLatitude: number;
  receiverLongitude: number;
  totalWeight: number; // kg
  totalVolume: number; // m³
  codAmount: number; // Tiền thu hộ VNĐ
  priority: OrderPriority;
  deliveryWindowStart: string; // ISO string
  deliveryWindowEnd: string; // ISO string
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
}

/**
 * Trạng thái của chuyến giao hàng (Delivery)
 */
export type DeliveryStatus =
  | "PENDING"
  | "ASSIGNED"
  | "ACCEPTED"
  | "PICKING_UP"
  | "IN_TRANSIT"
  | "ARRIVED"
  | "DELIVERED"
  | "DELIVERY_FAILED"
  | "RETURNING"
  | "CANCELLED";

/**
 * Chuyến giao hàng
 */
export interface Delivery {
  id: string;
  deliveryCode: string;
  orderId: string;
  driverId?: string;
  vehicleId?: string;
  status: DeliveryStatus;
  startedAt?: string;
  completedAt?: string;
  failedReason?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Lịch sử dòng thời gian chuyển trạng thái chuyến giao
 */
export interface DeliveryStatusHistoryItem {
  id: string;
  deliveryId: string;
  status: DeliveryStatus;
  timestamp: string;
  description: string;
  location?: GeoCoordinates;
  note?: string;
}

/**
 * Trạng thái hoạt động của tài xế
 */
export type DriverStatus =
  | "AVAILABLE"      // Sẵn sàng nhận chuyến
  | "BUSY"           // Đang thực hiện chuyến
  | "ON_BREAK"       // Nghỉ ca
  | "OFFLINE"        // Ngoại tuyến
  | "SUSPENDED";     // Tạm khóa tài khoản

/**
 * Hồ sơ tài xế
 */
export interface Driver {
  id: string;
  userId: string;
  driverCode: string;
  fullName: string;
  phone: string;
  licenseNumber: string;
  licenseType: "B2" | "C" | "D" | "E" | "FC";
  licenseExpiredAt: string;
  status: DriverStatus;
  currentLocation: GeoCoordinates;
  currentVehicleId?: string;
  currentDeliveryCount: number;
  todayCompletedDeliveries: number;
  onTimeRate: number; // % ví dụ 98.5
  successRate: number; // % ví dụ 99.1
}

/**
 * Phân loại phương tiện vận chuyển
 */
export type VehicleType = "MOTORBIKE" | "CAR" | "VAN" | "TRUCK";

/**
 * Trạng thái hoạt động của phương tiện
 */
export type VehicleStatus =
  | "AVAILABLE"      // Sẵn sàng
  | "EN_ROUTE"       // Đang chạy tuyến
  | "LOADING"        // Đang bốc dỡ hàng
  | "MAINTENANCE"    // Đang bảo dưỡng
  | "OFFLINE";       // Không khả dụng

/**
 * Trạng thái hiệu lực Đăng kiểm phương tiện
 */
export type VehicleInspectionStatus = "VALID" | "EXPIRING_SOON" | "EXPIRED";

/**
 * Hồ sơ phương tiện & Giấy tờ pháp lý vận tải
 */
export interface Vehicle {
  id: string;
  vehicleCode: string;
  licensePlate: string;
  type: VehicleType;
  brand: string;
  model: string;
  capacityWeight: number; // kg
  capacityVolume: number; // m³
  currentMileage: number; // km
  fuelPercent: number; // %
  status: VehicleStatus;
  driverId?: string;
  nextMaintenanceDate: string; // Ngày bảo dưỡng dự kiến
  // Nghiệp vụ đăng kiểm & bảo hiểm pháp lý thực tế
  inspectionCertificateNumber?: string; // Số tem / Sổ kiểm định (VD: "KD-9823412")
  lastInspectionDate?: string;          // Ngày đăng kiểm gần nhất (VD: "2026-03-15")
  inspectionExpiryDate?: string;        // Hạn đăng kiểm tiếp theo (VD: "2026-09-25")
  insuranceExpiryDate?: string;         // Hạn bảo hiểm bắt buộc TNDS (VD: "2027-01-10")
  inspectionCenter?: string;            // Trung tâm đăng kiểm (VD: "TTĐK 29-03V (Hà Nội)")
  inspectionNotes?: string;             // Ghi chú cơ sở kiểm định
}

/**
 * Phân loại Kho bãi & Trung tâm trung chuyển (Hub)
 */
export type WarehouseType = "CENTRAL_HUB" | "TRANSIT_HUB" | "LAST_MILE_HUB";
export type WarehouseRegion = "NORTH" | "CENTRAL" | "SOUTH";
export type WarehouseStorageType = "DRY" | "COLD" | "MIXED";
export type WarehouseStatus = "ACTIVE" | "MAINTENANCE" | "FULL";

/**
 * Kho bãi & Trung tâm trung chuyển (Hub)
 */
export interface Warehouse {
  id: string;
  code: string;
  name: string;
  type?: WarehouseType;
  region?: WarehouseRegion;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  openingTime: string; // "06:00"
  closingTime: string; // "22:00"
  capacity: number; // tấn
  usedCapacity: number; // tấn
  areaSqM?: number; // Diện tích sàn m²
  totalPallets?: number; // Tổng sức chứa pallet
  usedPallets?: number; // Pallet đang sử dụng
  dockDoors?: number; // Số cổng xuất nhập bãi
  storageType?: WarehouseStorageType; // Loại hình lưu kho
  managerName?: string; // Người phụ trách
  managerPhone?: string; // Số điện thoại
  managerEmail?: string; // Email liên hệ
  status: WarehouseStatus;
}

/**
 * Phân công tài xế
 */
export type AssignmentType = "MANUAL" | "RULE_BASED" | "AI_RECOMMENDED";

export interface DriverAssignment {
  id: string;
  deliveryId: string;
  driverId: string;
  vehicleId: string;
  score: number; // 0 - 100
  assignmentType: AssignmentType;
  assignedAt: string;
  acceptedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

/**
 * Điểm dừng trên tuyến đường
 */
export type RouteStopStatus = "PENDING" | "ARRIVED" | "COMPLETED" | "SKIPPED";

export interface RouteStop {
  id: string;
  routeId: string;
  deliveryId: string;
  sequence: number;
  latitude: number;
  longitude: number;
  estimatedArrival: string;
  actualArrival?: string;
  status: RouteStopStatus;
}

/**
 * Trạng thái tuyến đường
 */
export type RouteStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "CANCELLED";

/**
 * Tuyến đường vận chuyển
 */
export interface Route {
  id: string;
  routeCode: string;
  driverId: string;
  vehicleId: string;
  warehouseId: string;
  totalDistance: number; // km
  estimatedDuration: number; // phút
  status: RouteStatus;
  startedAt?: string;
  completedAt?: string;
  stops?: RouteStop[];
}

/**
 * Dữ liệu telemetry vị trí GPS Realtime của phương tiện
 */
export interface VehicleTelemetry {
  vehicleId: string;
  driverId?: string;
  driverName?: string;
  plateNumber: string;
  coordinates: GeoCoordinates;
  bearing: number; // Góc quay xe (0-360 độ)
  speedKmH: number; // Tốc độ km/h
  fuelPercent: number; // Nhiên liệu 0-100%
  updatedAt: string;
}

/**
 * Thông báo hệ thống
 */
export type NotificationType =
  | "ORDER_CREATED"
  | "ORDER_ASSIGNED"
  | "ORDER_ACCEPTED"
  | "DELIVERY_SUCCESS"
  | "DELIVERY_FAILED"
  | "LATE_WARNING"
  | "VEHICLE_ALERT"
  | "GPS_ALERT";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  createdAt: string;
  referenceId?: string;
}

/**
 * Số liệu phân tích Dashboard vận hành
 */
export interface AnalyticsSummary {
  totalOrdersToday: number;
  inTransitOrders: number;
  deliveredOrders: number;
  failedOrders: number;
  delayedOrders: number;
  activeDrivers: number;
  availableDrivers: number;
  activeVehicles: number;
  fleetUtilizationRate: number; // %
  onTimeDeliveryRate: number; // %
}

export interface HourlyOrderStat {
  hour: string;
  count: number;
}

export interface DailyDeliveryStat {
  date: string;
  success: number;
  failed: number;
}

export interface OnTimeRateTrend {
  date: string;
  rate: number;
}

export interface DriverPerformanceStat {
  driverName: string;
  completed: number;
  rating: number;
}

export interface VehiclePerformanceStat {
  plateNumber: string;
  utilizationRate: number;
  mileage: number;
}

export interface StatusDistributionItem {
  status: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AnalyticsDashboardData {
  summary: AnalyticsSummary;
  hourlyOrders: HourlyOrderStat[];
  dailyDeliveries: DailyDeliveryStat[];
  onTimeRateTrends: OnTimeRateTrend[];
  driverPerformance: DriverPerformanceStat[];
  vehiclePerformance: VehiclePerformanceStat[];
  statusDistribution: StatusDistributionItem[];
}
