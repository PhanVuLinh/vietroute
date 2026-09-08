import { ENV } from "@/core/config/env";
import { httpClient } from "@/core/http/client";
import type { ApiPaginatedResponse } from "@/core/types/api";
import type {
  AnalyticsDashboardData,
  AssignmentType,
  Delivery,
  DeliveryStatus,
  DeliveryStatusHistoryItem,
  Driver,
  DriverAssignment,
  NotificationItem,
  Order,
  OrderStatus,
  Route,
  Vehicle,
  Warehouse,
} from "@/core/types/logistics";
import type { AuthUser, LoginCredentials, LoginResponseData } from "@/core/types/auth";

import { mockAuthService } from "../services/mockAuthService";
import { mockUserService } from "../services/mockUserService";
import { mockDriverService, type DriverFilterParams } from "../services/mockDriverService";
import { mockVehicleService, type VehicleFilterParams } from "../services/mockVehicleService";
import { mockWarehouseService } from "../services/mockWarehouseService";
import { mockOrderService, type OrderFilterParams } from "../services/mockOrderService";
import { mockDeliveryService, type DeliveryFilterParams } from "../services/mockDeliveryService";
import { mockDispatchService } from "../services/mockDispatchService";
import { mockRouteService, type RouteFilterParams } from "../services/mockRouteService";
import { mockNotificationService } from "../services/mockNotificationService";
import { mockAnalyticsService } from "../services/mockAnalyticsService";

// ==========================================
// 1. API REAL SERVICES (Dùng khi VITE_USE_MOCK=false)
// ==========================================
const apiAuthService = {
  login: (credentials: LoginCredentials) =>
    httpClient.post<LoginResponseData | null>("/auth/login", credentials),
};

const apiUserService = {
  getUsers: () => httpClient.get<AuthUser[]>("/users"),
  getUserById: (id: string) => httpClient.get<AuthUser>(`/users/${id}`),
};

const apiDriverService = {
  getDrivers: (params?: DriverFilterParams) => httpClient.get<Driver[]>("/drivers", { params }),
  getDriverById: (id: string) => httpClient.get<Driver>(`/drivers/${id}`),
  updateDriverStatus: (id: string, status: string) => httpClient.patch<Driver>(`/drivers/${id}/status`, { status }),
};

const apiVehicleService = {
  getVehicles: (params?: VehicleFilterParams) => httpClient.get<Vehicle[]>("/vehicles", { params }),
  getVehicleById: (id: string) => httpClient.get<Vehicle>(`/vehicles/${id}`),
  updateVehicleStatus: (id: string, status: string) => httpClient.patch<Vehicle>(`/vehicles/${id}/status`, { status }),
};

const apiWarehouseService = {
  getWarehouses: (params?: { city?: string }) => httpClient.get<Warehouse[]>("/warehouses", { params }),
  getWarehouseById: (id: string) => httpClient.get<Warehouse>(`/warehouses/${id}`),
};

const apiOrderService = {
  getOrders: (params?: OrderFilterParams) => httpClient.get<ApiPaginatedResponse<Order>["data"]>("/orders", { params }) as unknown as Promise<ApiPaginatedResponse<Order>>,
  getOrderById: (id: string) => httpClient.get<Order>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: OrderStatus) => httpClient.patch<Order>(`/orders/${id}/status`, { status }),
  createOrder: (data: unknown) => httpClient.post<Order>("/orders", data),
};

const apiDeliveryService = {
  getDeliveries: (params?: DeliveryFilterParams) => httpClient.get<ApiPaginatedResponse<Delivery>["data"]>("/deliveries", { params }) as unknown as Promise<ApiPaginatedResponse<Delivery>>,
  getDeliveryById: (id: string) => httpClient.get<Delivery>(`/deliveries/${id}`),
  getDeliveryHistory: (id: string) => httpClient.get<DeliveryStatusHistoryItem[]>(`/deliveries/${id}/history`),
  updateDeliveryStatus: (id: string, status: DeliveryStatus, note?: string) => httpClient.patch<Delivery>(`/deliveries/${id}/status`, { status, note }),
};

const apiDispatchService = {
  getAssignments: () => httpClient.get<DriverAssignment[]>("/dispatch/assignments"),
  assignDelivery: (deliveryId: string, driverId: string, vehicleId: string, assignmentType?: AssignmentType) =>
    httpClient.post<DriverAssignment>("/dispatch/assign", { deliveryId, driverId, vehicleId, assignmentType }),
};

const apiRouteService = {
  getRoutes: (params?: RouteFilterParams) => httpClient.get<Route[]>("/routes", { params }),
  getRouteById: (id: string) => httpClient.get<Route>(`/routes/${id}`),
};

const apiNotificationService = {
  getNotifications: (params?: { unreadOnly?: boolean }) => httpClient.get<NotificationItem[]>("/notifications", { params }),
  markAsRead: (id: string) => httpClient.patch<boolean>(`/notifications/${id}/read`),
  markAllAsRead: () => httpClient.post<boolean>("/notifications/read-all"),
};

const apiAnalyticsService = {
  getDashboardAnalytics: () => httpClient.get<AnalyticsDashboardData>("/analytics/dashboard"),
};

// ==========================================
// 2. SERVICE FACTORY TỰ ĐỘNG CHUYỂN ĐỔI THEO ENV
// ==========================================
const isMock = ENV.USE_MOCK;

export const authService = isMock ? mockAuthService : apiAuthService;
export const userService = isMock ? mockUserService : apiUserService;
export const driverService = isMock ? mockDriverService : apiDriverService;
export const vehicleService = isMock ? mockVehicleService : apiVehicleService;
export const warehouseService = isMock ? mockWarehouseService : apiWarehouseService;
export const orderService = isMock ? mockOrderService : apiOrderService;
export const deliveryService = isMock ? mockDeliveryService : apiDeliveryService;
export const dispatchService = isMock ? mockDispatchService : apiDispatchService;
export const routeService = isMock ? mockRouteService : apiRouteService;
export const notificationService = isMock ? mockNotificationService : apiNotificationService;
export const analyticsService = isMock ? mockAnalyticsService : apiAnalyticsService;

