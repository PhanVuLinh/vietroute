import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  analyticsService,
  driverService,
  vehicleService,
  warehouseService,
  orderService,
} from "@/mocks/adapters/serviceFactory";
import type {
  AnalyticsDashboardData,
  Driver,
  Vehicle,
  Warehouse,
  Order,
} from "@/core/types/logistics";

export type ReportTimeRange =
  | "TODAY"
  | "LAST_7_DAYS"
  | "LAST_30_DAYS"
  | "THIS_MONTH"
  | "THIS_QUARTER";

export interface TimeRangeOption {
  value: ReportTimeRange;
  label: string;
  subLabel: string;
}

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  { value: "TODAY", label: "Hôm nay", subLabel: "Theo thời gian thực" },
  { value: "LAST_7_DAYS", label: "7 ngày qua", subLabel: "Gần nhất" },
  { value: "LAST_30_DAYS", label: "30 ngày qua", subLabel: "1 tháng" },
  { value: "THIS_MONTH", label: "Tháng này", subLabel: "Tháng 09/2026" },
  { value: "THIS_QUARTER", label: "Quý này", subLabel: "Quý III/2026" },
];

export interface RegionDistribution {
  region: string;
  name: string;
  orderCount: number;
  percentage: number;
  revenueVND: number;
  color: string;
}

export interface FuelAndCostData {
  period: string;
  fuelLiters: number;
  tollFeeVND: number;
  avgCostPerKm: number;
  distanceKm: number;
}

export function useReports() {
  const [timeRange, setTimeRange] = useState<ReportTimeRange>("LAST_7_DAYS");
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>("ALL");

  // 1. Lấy dữ liệu phân tích vận hành chính
  const analyticsQuery = useQuery({
    queryKey: ["reports", "analytics", timeRange, selectedWarehouseId],
    queryFn: async () => {
      const res = await analyticsService.getDashboardAnalytics();
      return res.data;
    },
  });

  // 2. Lấy danh sách tài xế
  const driversQuery = useQuery({
    queryKey: ["reports", "drivers"],
    queryFn: async () => {
      const res = await driverService.getDrivers();
      return res.data;
    },
  });

  // 3. Lấy danh sách phương tiện
  const vehiclesQuery = useQuery({
    queryKey: ["reports", "vehicles"],
    queryFn: async () => {
      const res = await vehicleService.getVehicles();
      return res.data;
    },
  });

  // 4. Lấy danh sách kho bãi
  const warehousesQuery = useQuery({
    queryKey: ["reports", "warehouses"],
    queryFn: async () => {
      const res = await warehouseService.getWarehouses();
      return res.data;
    },
  });

  // 5. Lấy danh sách đơn hàng để tính toán COD & trọng lượng
  const ordersQuery = useQuery({
    queryKey: ["reports", "orders"],
    queryFn: async () => {
      const res = await orderService.getOrders({ page: 1, pageSize: 100 });
      return res.data?.items || [];
    },
  });

  const rawAnalytics = analyticsQuery.data as AnalyticsDashboardData | undefined;
  const rawDrivers = (driversQuery.data || []) as Driver[];
  const rawVehicles = (vehiclesQuery.data || []) as Vehicle[];
  const rawWarehouses = (warehousesQuery.data || []) as Warehouse[];
  const rawOrders = (ordersQuery.data || []) as Order[];

  // Dữ liệu chi phí & nhiên liệu mô phỏng theo mốc thời gian
  const costAndFuelTrends = useMemo<FuelAndCostData[]>(() => {
    switch (timeRange) {
      case "TODAY":
        return [
          { period: "06:00 - 09:00", fuelLiters: 48, tollFeeVND: 120000, avgCostPerKm: 4200, distanceKm: 180 },
          { period: "09:00 - 12:00", fuelLiters: 72, tollFeeVND: 210000, avgCostPerKm: 3950, distanceKm: 290 },
          { period: "13:00 - 15:00", fuelLiters: 65, tollFeeVND: 180000, avgCostPerKm: 4100, distanceKm: 250 },
          { period: "15:00 - 18:00", fuelLiters: 90, tollFeeVND: 250000, avgCostPerKm: 4050, distanceKm: 360 },
          { period: "18:00 - 21:00", fuelLiters: 35, tollFeeVND: 90000, avgCostPerKm: 3800, distanceKm: 145 },
        ];
      case "LAST_30_DAYS":
      case "THIS_MONTH":
        return [
          { period: "Tuần 1", fuelLiters: 620, tollFeeVND: 1750000, avgCostPerKm: 3950, distanceKm: 2480 },
          { period: "Tuần 2", fuelLiters: 710, tollFeeVND: 1980000, avgCostPerKm: 3880, distanceKm: 2890 },
          { period: "Tuần 3", fuelLiters: 680, tollFeeVND: 1820000, avgCostPerKm: 3920, distanceKm: 2710 },
          { period: "Tuần 4", fuelLiters: 740, tollFeeVND: 2050000, avgCostPerKm: 3850, distanceKm: 3020 },
        ];
      case "THIS_QUARTER":
        return [
          { period: "Tháng 07", fuelLiters: 2850, tollFeeVND: 7800000, avgCostPerKm: 3920, distanceKm: 11400 },
          { period: "Tháng 08", fuelLiters: 3100, tollFeeVND: 8450000, avgCostPerKm: 3870, distanceKm: 12600 },
          { period: "Tháng 09 (hiện tại)", fuelLiters: 2750, tollFeeVND: 7600000, avgCostPerKm: 3820, distanceKm: 11100 },
        ];
      case "LAST_7_DAYS":
      default:
        return [
          { period: "31/08", fuelLiters: 88, tollFeeVND: 240000, avgCostPerKm: 4020, distanceKm: 365 },
          { period: "01/09", fuelLiters: 95, tollFeeVND: 280000, avgCostPerKm: 3980, distanceKm: 398 },
          { period: "02/09", fuelLiters: 76, tollFeeVND: 190000, avgCostPerKm: 4150, distanceKm: 312 },
          { period: "03/09", fuelLiters: 104, tollFeeVND: 310000, avgCostPerKm: 3920, distanceKm: 440 },
          { period: "04/09", fuelLiters: 112, tollFeeVND: 340000, avgCostPerKm: 3890, distanceKm: 475 },
          { period: "05/09", fuelLiters: 118, tollFeeVND: 360000, avgCostPerKm: 3860, distanceKm: 505 },
          { period: "06/09", fuelLiters: 65, tollFeeVND: 180000, avgCostPerKm: 4080, distanceKm: 270 },
        ];
    }
  }, [timeRange]);

  // Phân bổ đơn hàng theo vùng miền
  const regionalDistribution = useMemo<RegionDistribution[]>(() => {
    return [
      {
        region: "NORTH",
        name: "Miền Bắc (Hà Nội & lân cận)",
        orderCount: 198,
        percentage: 51.4,
        revenueVND: 95400000,
        color: "#2563eb", // Blue
      },
      {
        region: "CENTRAL",
        name: "Miền Trung (Đà Nẵng - Quảng Ngãi)",
        orderCount: 108,
        percentage: 28.1,
        revenueVND: 52100000,
        color: "#0d9488", // Teal
      },
      {
        region: "SOUTH",
        name: "Miền Nam (TP.HCM & Đông Nam Bộ)",
        orderCount: 79,
        percentage: 20.5,
        revenueVND: 37920000,
        color: "#8b5cf6", // Purple
      },
    ];
  }, []);

  // Top tài xế có thành tích xuất sắc nhất kèm thông tin enriched
  const enrichedDriverRanking = useMemo(() => {
    const list = [...rawDrivers];
    list.sort((a, b) => b.todayCompletedDeliveries - a.todayCompletedDeliveries || b.onTimeRate - a.onTimeRate);

    return list.slice(0, 5).map((d, index) => {
      const assignedVehicle = rawVehicles.find((v) => v.driverId === d.id);
      return {
        rank: index + 1,
        driver: d,
        vehicle: assignedVehicle,
        completedDeliveries: d.todayCompletedDeliveries * 7 + (15 - index * 2),
        onTimeRate: d.onTimeRate,
        successRate: d.successRate,
        rating: 4.7 + (5 - index) * 0.05 > 5 ? 5 : Math.round((4.7 + (5 - index) * 0.05) * 10) / 10,
        totalDistanceKm: 1200 - index * 140,
      };
    });
  }, [rawDrivers, rawVehicles]);

  // Thống kê tổng hợp toàn diện (Summary Metrics)
  const stats = useMemo(() => {
    const totalOrders = rawAnalytics?.summary.totalOrdersToday || 50;
    const otdRate = rawAnalytics?.summary.onTimeDeliveryRate || 97.2;
    const fleetUtil = rawAnalytics?.summary.fleetUtilizationRate || 84.5;
    const totalDistance = costAndFuelTrends.reduce((acc, c) => acc + c.distanceKm, 0);
    const totalFuel = costAndFuelTrends.reduce((acc, c) => acc + c.fuelLiters, 0);
    const totalTollFee = costAndFuelTrends.reduce((acc, c) => acc + c.tollFeeVND, 0);

    const totalCod = rawOrders.reduce((acc, o) => acc + (o.codAmount || 0), 0);

    return {
      totalOrders,
      otdRate,
      fleetUtil,
      totalDistanceKm: totalDistance,
      totalFuelLiters: totalFuel,
      totalTollFeeVND: totalTollFee,
      totalCodVND: totalCod > 0 ? totalCod : 185420000,
      activeDriversCount: rawAnalytics?.summary.activeDrivers || 11,
      activeVehiclesCount: rawAnalytics?.summary.activeVehicles || 13,
      avgFuelConsumptionPer100Km: totalDistance > 0 ? Math.round((totalFuel / totalDistance) * 100 * 10) / 10 : 23.5,
      estimatedSavedCostVND: 14500000, // Ước tính tiết kiệm nhờ thuật toán VietRoute
    };
  }, [rawAnalytics, costAndFuelTrends, rawOrders]);

  const isLoading =
    analyticsQuery.isLoading ||
    driversQuery.isLoading ||
    vehiclesQuery.isLoading ||
    warehousesQuery.isLoading;

  const isError =
    analyticsQuery.isError ||
    driversQuery.isError ||
    vehiclesQuery.isError ||
    warehousesQuery.isError;

  const refetchAll = () => {
    analyticsQuery.refetch();
    driversQuery.refetch();
    vehiclesQuery.refetch();
    warehousesQuery.refetch();
    ordersQuery.refetch();
  };

  return {
    timeRange,
    setTimeRange,
    selectedWarehouseId,
    setSelectedWarehouseId,
    analytics: rawAnalytics,
    drivers: rawDrivers,
    vehicles: rawVehicles,
    warehouses: rawWarehouses,
    orders: rawOrders,
    stats,
    costAndFuelTrends,
    regionalDistribution,
    enrichedDriverRanking,
    isLoading,
    isError,
    refetchAll,
  };
}
