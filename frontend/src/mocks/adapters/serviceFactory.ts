import { ENV } from "@/core/config/env";
import { httpClient } from "@/core/http/client";
import type { ApiPaginatedResponse, PaginatedData } from "@/core/types/api";
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
  RouteStatus,
  RouteStop,
  RouteStopStatus,
  Vehicle,
  Warehouse,
} from "@/core/types/logistics";
import type { AuthUser, LoginCredentials, LoginResponseData } from "@/core/types/auth";

import { mockAuthService } from "../services/mockAuthService";
import { mockUserService } from "../services/mockUserService";
import { mockDriverService, type DriverFilterParams } from "../services/mockDriverService";
import { mockVehicleService, type VehicleFilterParams } from "../services/mockVehicleService";
import { mockWarehouseService, type WarehouseFilterParams } from "../services/mockWarehouseService";
import { mockOrderService, type OrderFilterParams } from "../services/mockOrderService";
import { mockDeliveryService, type DeliveryFilterParams } from "../services/mockDeliveryService";
import { mockDispatchService } from "../services/mockDispatchService";
import { mockRouteService, type RouteFilterParams } from "../services/mockRouteService";
import { mockNotificationService } from "../services/mockNotificationService";
import { mockAnalyticsService } from "../services/mockAnalyticsService";
import { mockCustomerService } from "../services/mockCustomerService";
import { mockInventoryService } from "../services/mockInventoryService";
import { mockIncidentService } from "../services/mockIncidentService";
import type { EnrichedCustomer } from "@/modules/customers/types/customer";
import type {
  InboundReceipt,
  OutboundDispatch,
  InventoryItem,
  StockTransfer,
  WarehouseActivity,
} from "@/modules/warehouses/types/wms";
import type { Incident, IncidentStatus } from "@/modules/incidents/types/incident";


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
  createDriver: (data: Omit<Driver, "id">) => httpClient.post<Driver>("/drivers", data),
  updateDriver: (id: string, data: Partial<Driver>) => httpClient.patch<Driver>(`/drivers/${id}`, data),
  deleteDriver: (id: string) => httpClient.delete<boolean>(`/drivers/${id}`),
};

const apiVehicleService = {
  getVehicles: (params?: VehicleFilterParams) => httpClient.get<Vehicle[]>("/vehicles", { params }),
  getVehicleById: (id: string) => httpClient.get<Vehicle>(`/vehicles/${id}`),
  updateVehicleStatus: (id: string, status: string) => httpClient.patch<Vehicle>(`/vehicles/${id}/status`, { status }),
  createVehicle: (data: Omit<Vehicle, "id">) => httpClient.post<Vehicle>("/vehicles", data),
  updateVehicle: (id: string, data: Partial<Vehicle>) => httpClient.patch<Vehicle>(`/vehicles/${id}`, data),
  deleteVehicle: (id: string) => httpClient.delete<boolean>(`/vehicles/${id}`),
};

const apiWarehouseService = {
  getWarehouses: (params?: WarehouseFilterParams) => httpClient.get<Warehouse[]>("/warehouses", { params }),
  getWarehouseById: (id: string) => httpClient.get<Warehouse>(`/warehouses/${id}`),
  createWarehouse: (data: Omit<Warehouse, "id">) => httpClient.post<Warehouse>("/warehouses", data),
  updateWarehouse: (id: string, data: Partial<Warehouse>) => httpClient.patch<Warehouse>(`/warehouses/${id}`, data),
  updateWarehouseStatus: (id: string, status: string) => httpClient.patch<Warehouse>(`/warehouses/${id}/status`, { status }),
  deleteWarehouse: (id: string) => httpClient.delete<boolean>(`/warehouses/${id}`),
};

const apiOrderService = {
  getOrders: (params?: OrderFilterParams): Promise<ApiPaginatedResponse<Order>> =>
    httpClient.get<PaginatedData<Order>>("/orders", { params }),
  getOrderById: (id: string) => httpClient.get<Order>(`/orders/${id}`),
  updateOrderStatus: (id: string, status: OrderStatus) => httpClient.patch<Order>(`/orders/${id}/status`, { status }),
  createOrder: (data: unknown) => httpClient.post<Order>("/orders", data),
};

const apiDeliveryService = {
  getDeliveries: (params?: DeliveryFilterParams): Promise<ApiPaginatedResponse<Delivery>> =>
    httpClient.get<PaginatedData<Delivery>>("/deliveries", { params }),
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
  createRoute: (data: Omit<Route, "id">) => httpClient.post<Route>("/routes", data),
  updateRoute: (id: string, data: Partial<Route>) => httpClient.patch<Route>(`/routes/${id}`, data),
  updateRouteStatus: (id: string, status: RouteStatus) => httpClient.patch<Route>(`/routes/${id}/status`, { status }),
  updateStopStatus: (routeId: string, stopId: string, status: RouteStopStatus) => httpClient.patch<Route>(`/routes/${routeId}/stops/${stopId}/status`, { status }),
  deleteRoute: (id: string) => httpClient.delete<boolean>(`/routes/${id}`),
  optimizeStops: (originCoords: [number, number], stops: RouteStop[]) => httpClient.post<RouteStop[]>("/routes/optimize", { originCoords, stops }),
};

const apiNotificationService = {
  getNotifications: (params?: { unreadOnly?: boolean }) => httpClient.get<NotificationItem[]>("/notifications", { params }),
  markAsRead: (id: string) => httpClient.patch<boolean>(`/notifications/${id}/read`),
  markAllAsRead: () => httpClient.post<boolean>("/notifications/read-all"),
};

const apiAnalyticsService = {
  getDashboardAnalytics: () => httpClient.get<AnalyticsDashboardData>("/analytics/dashboard"),
};

const apiCustomerService = {
  getCustomers: (params?: { searchQuery?: string; type?: string }) => httpClient.get<EnrichedCustomer[]>("/customers", { params }),
  getCustomerById: (id: string) => httpClient.get<EnrichedCustomer>(`/customers/${id}`),
  createCustomer: (data: Omit<import("@/core/types/logistics").Customer, "id">) => httpClient.post<EnrichedCustomer>("/customers", data),
  updateCustomer: (id: string, data: Partial<import("@/core/types/logistics").Customer>) => httpClient.patch<EnrichedCustomer>(`/customers/${id}`, data),
  deleteCustomer: (id: string) => httpClient.delete<boolean>(`/customers/${id}`),
};

const apiInventoryService = {
  getInboundReceipts: (params?: { warehouseId?: string }) => httpClient.get<InboundReceipt[]>("/wms/inbounds", { params }),
  getOutboundDispatches: (params?: { warehouseId?: string }) => httpClient.get<OutboundDispatch[]>("/wms/outbounds", { params }),
  getInventory: (params?: { warehouseId?: string }) => httpClient.get<InventoryItem[]>("/wms/inventory", { params }),
  getStockTransfers: (params?: { warehouseId?: string }) => httpClient.get<StockTransfer[]>("/wms/transfers", { params }),
  getActivityLog: (params?: { warehouseId?: string }) => httpClient.get<WarehouseActivity[]>("/wms/activities", { params }),
  createInboundReceipt: (data: Omit<InboundReceipt, "id">) =>
    httpClient.post<InboundReceipt>("/wms/inbounds", {
      warehouse_id: data.warehouseId,
      receipt_code: data.receiptCode,
      supplier_name: data.supplierName,
      item_count: data.itemCount,
      total_weight: data.totalWeight,
      status: data.status,
      received_by: data.receivedBy,
      notes: data.notes,
    }),
  createOutboundDispatch: (data: Omit<OutboundDispatch, "id">) =>
    httpClient.post<OutboundDispatch>("/wms/outbounds", {
      warehouse_id: data.warehouseId,
      dispatch_code: data.dispatchCode,
      order_code: data.orderCode,
      route_code: data.routeCode,
      item_count: data.itemCount,
      total_weight: data.totalWeight,
      status: data.status,
      picked_by: data.pickedBy,
      notes: data.notes,
    }),
  createStockTransfer: (data: Omit<StockTransfer, "id">) =>
    httpClient.post<StockTransfer>("/wms/transfers", {
      from_warehouse_id: data.fromWarehouseId,
      to_warehouse_id: data.toWarehouseId,
      transfer_code: data.transferCode,
      item_count: data.itemCount,
      total_weight: data.totalWeight,
      status: data.status,
      created_by: data.createdBy,
    }),
};

const apiIncidentService = {
  getIncidents: (params?: { status?: IncidentStatus; severity?: string }) => httpClient.get<Incident[]>("/incidents", { params }),
  getIncidentById: (id: string) => httpClient.get<Incident>(`/incidents/${id}`),
  createIncident: (data: Omit<Incident, "id" | "incidentCode" | "comments">) =>
    httpClient.post<Incident>("/incidents", {
      title: data.title,
      description: data.description,
      type: data.type,
      severity: data.severity,
      order_code: data.orderCode,
      driver_name: data.driverName,
      vehicle_plate: data.vehiclePlate,
      warehouse_name: data.warehouseName,
      reported_by: data.reportedBy,
      assigned_to: data.assignedTo,
    }),
  updateIncidentStatus: (id: string, status: IncidentStatus) => httpClient.patch<Incident>(`/incidents/${id}/status`, { status }),
  addComment: (incidentId: string, user: string, message: string) => httpClient.post<boolean>(`/incidents/${incidentId}/comments`, { user, message }),
};

const apiFinanceService = {
  getCodReconciliations: (params?: { driverId?: string; status?: string; search?: string }) =>
    httpClient.get<import("@/modules/finance/types/finance").CodReconciliationItem[]>("/finance/cod", { params }),
  getCodSummary: () =>
    httpClient.get<import("@/modules/finance/types/finance").CodSummary>("/finance/cod/summary"),
  getCodReconciliationById: (id: string) =>
    httpClient.get<import("@/modules/finance/types/finance").CodReconciliationItem>(`/finance/cod/${id}`),
  createCodReconciliation: (data: any) =>
    httpClient.post<import("@/modules/finance/types/finance").CodReconciliationItem>("/finance/cod", data),
  submitCod: (id: string, data: { submitted_amount: number; cashier_name?: string; notes?: string }) =>
    httpClient.post<import("@/modules/finance/types/finance").CodReconciliationItem>(`/finance/cod/${id}/submit`, data),
  getInvoices: (params?: { customerId?: string; status?: string; search?: string }) =>
    httpClient.get<import("@/modules/finance/types/finance").InvoiceItem[]>("/finance/invoices", { params }),
  getBillingSummary: () =>
    httpClient.get<import("@/modules/finance/types/finance").BillingSummary>("/finance/invoices/summary"),
  getAgingReport: () =>
    httpClient.get<import("@/modules/finance/types/finance").AgingReport>("/finance/invoices/aging-report"),
  getInvoiceById: (id: string) =>
    httpClient.get<import("@/modules/finance/types/finance").InvoiceItem>(`/finance/invoices/${id}`),
  createInvoice: (data: any) =>
    httpClient.post<import("@/modules/finance/types/finance").InvoiceItem>("/finance/invoices", data),
  updateInvoiceStatus: (id: string, status: string, paid_amount?: number) =>
    httpClient.patch<import("@/modules/finance/types/finance").InvoiceItem>(`/finance/invoices/${id}/status`, { status, paid_amount }),
  seedDemoData: () =>
    httpClient.post<{ success: boolean; message: string }>("/finance/seed-demo"),
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
export const customerService = isMock ? mockCustomerService : apiCustomerService;
export const inventoryService = isMock ? mockInventoryService : apiInventoryService;
export const incidentService = isMock ? mockIncidentService : apiIncidentService;
export const financeService = apiFinanceService;

