import type { AnalyticsDashboardData } from "@/core/types/logistics";

export const MOCK_ANALYTICS: AnalyticsDashboardData = {
  summary: {
    totalOrdersToday: 50,
    inTransitOrders: 14,
    deliveredOrders: 28,
    failedOrders: 3,
    delayedOrders: 2,
    activeDrivers: 11,
    availableDrivers: 5,
    activeVehicles: 13,
    fleetUtilizationRate: 84.5,
    onTimeDeliveryRate: 97.2,
  },

  // Số lượng đơn tiếp nhận theo từng khung giờ trong ngày
  hourlyOrders: [
    { hour: "06:00", count: 3 },
    { hour: "07:00", count: 7 },
    { hour: "08:00", count: 12 },
    { hour: "09:00", count: 9 },
    { hour: "10:00", count: 6 },
    { hour: "11:00", count: 4 },
    { hour: "13:00", count: 5 },
    { hour: "14:00", count: 8 },
    { hour: "15:00", count: 10 },
    { hour: "16:00", count: 6 },
    { hour: "17:00", count: 4 },
  ],

  // Thống kê giao hàng 7 ngày gần nhất
  dailyDeliveries: [
    { date: "31/08", success: 42, failed: 2 },
    { date: "01/09", success: 48, failed: 1 },
    { date: "02/09", success: 35, failed: 1 },
    { date: "03/09", success: 52, failed: 3 },
    { date: "04/09", success: 58, failed: 2 },
    { date: "05/09", success: 61, failed: 2 },
    { date: "06/09", success: 28, failed: 3 },
  ],

  // Xu hướng tỷ lệ giao đúng giờ (OTD) 7 ngày
  onTimeRateTrends: [
    { date: "31/08", rate: 96.5 },
    { date: "01/09", rate: 97.8 },
    { date: "02/09", rate: 98.2 },
    { date: "03/09", rate: 95.4 },
    { date: "04/09", rate: 97.0 },
    { date: "05/09", rate: 98.6 },
    { date: "06/09", rate: 97.2 },
  ],

  // Hiệu suất top tài xế tiêu biểu
  driverPerformance: [
    { driverName: "Nguyễn Văn An", completed: 184, rating: 4.9 },
    { driverName: "Đoàn Văn Hậu", completed: 172, rating: 4.9 },
    { driverName: "Nguyễn Tiến Linh", completed: 168, rating: 4.8 },
    { driverName: "Lê Văn Bình", completed: 155, rating: 4.8 },
    { driverName: "Võ Thanh Tùng", completed: 142, rating: 4.7 },
  ],

  // Hiệu suất và số km lăn bánh của đội xe
  vehiclePerformance: [
    { plateNumber: "29C-741.82", utilizationRate: 88.5, mileage: 3450 },
    { plateNumber: "51D-392.15", utilizationRate: 92.0, mileage: 4120 },
    { plateNumber: "43C-188.04", utilizationRate: 81.0, mileage: 2890 },
    { plateNumber: "29C-884.21", utilizationRate: 76.5, mileage: 2340 },
    { plateNumber: "65C-142.98", utilizationRate: 84.0, mileage: 3100 },
  ],

  // Phân bổ trạng thái đơn hàng toàn hệ thống
  statusDistribution: [
    { status: "DELIVERED", label: "Giao thành công", count: 28, percentage: 56.0 },
    { status: "IN_TRANSIT", label: "Đang vận chuyển", count: 14, percentage: 28.0 },
    { status: "PENDING", label: "Chờ xử lý", count: 3, percentage: 6.0 },
    { status: "ASSIGNED", label: "Đã phân công", count: 2, percentage: 4.0 },
    { status: "FAILED", label: "Giao thất bại", count: 3, percentage: 6.0 },
  ],
};
