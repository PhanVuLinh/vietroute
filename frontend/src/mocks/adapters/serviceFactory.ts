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

import type { DriverFilterParams } from "../services/mockDriverService";
import type { VehicleFilterParams } from "../services/mockVehicleService";
import type { WarehouseFilterParams } from "../services/mockWarehouseService";
import type { OrderFilterParams } from "../services/mockOrderService";
import type { DeliveryFilterParams } from "../services/mockDeliveryService";
import type { RouteFilterParams } from "../services/mockRouteService";
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

import type { StaffMember, RolePermissionItem, StaffFilterParams } from "@/modules/staff/types/staff";
import type {
  DepartmentItem,
  DepartmentFilterParams,
  CreateDepartmentInput,
  UpdateDepartmentInput,
} from "@/modules/staff/types/department";

const apiUserService = {
  getUsers: () => httpClient.get<AuthUser[]>("/users"),
  getUserById: (id: string) => httpClient.get<AuthUser>(`/users/${id}`),
  getStaffList: (params?: StaffFilterParams) => httpClient.get<StaffMember[]>("/users", { params }),
  getStaffById: (id: string) => httpClient.get<StaffMember>(`/users/${id}`),
  createStaff: (data: any) => httpClient.post<StaffMember>("/users", data),
  updateStaff: (id: string, data: any) => httpClient.put<StaffMember>(`/users/${id}`, data),
  updateStaffStatus: (id: string, status: string) => httpClient.patch<StaffMember>(`/users/${id}/status`, { status }),
  deleteStaff: (id: string) => httpClient.delete<{ success: boolean }>(`/users/${id}`),
  getRoles: () => httpClient.get<RolePermissionItem[]>("/users/roles"),
  createRole: (data: { name: string; description?: string; permissions?: string[] }) =>
    httpClient.post<RolePermissionItem>("/users/roles", data),
  updateRole: (id: string, data: { name?: string; description?: string; permissions?: string[] }) =>
    httpClient.put<RolePermissionItem>(`/users/roles/${id}`, data),
  deleteRole: (id: string) =>
    httpClient.delete<{ success: boolean; message?: string }>(`/users/roles/${id}`),
  updateRolePermissions: (roleId: string, permissions: string[], description?: string) =>
    httpClient.put<RolePermissionItem>(`/users/roles/${roleId}/permissions`, { permissions, description }),
};

const apiDepartmentService = {
  getDepartments: (params?: DepartmentFilterParams) =>
    httpClient.get<DepartmentItem[]>("/departments", { params }),
  getDepartmentById: (id: string) => httpClient.get<DepartmentItem>(`/departments/${id}`),
  createDepartment: (data: CreateDepartmentInput) =>
    httpClient.post<DepartmentItem>("/departments", data),
  updateDepartment: (id: string, data: UpdateDepartmentInput) =>
    httpClient.put<DepartmentItem>(`/departments/${id}`, data),
  deleteDepartment: (id: string) =>
    httpClient.delete<{ success: boolean; message?: string }>(`/departments/${id}`),
};

const apiDriverService = {
  getDrivers: (params?: DriverFilterParams) => httpClient.get<Driver[]>("/drivers", { params }),
  getDriverById: (id: string) => httpClient.get<Driver>(`/drivers/${id}`),
  getActiveShift: (identifier?: string) =>
    httpClient.get<any>(identifier ? `/drivers/active-shift/${identifier}` : "/drivers/active-shift"),
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
  submitPod: (id: string, podData: any) => httpClient.post<Order>(`/orders/${id}/pod`, podData),
};

const apiDeliveryService = {
  getDeliveries: (params?: DeliveryFilterParams): Promise<ApiPaginatedResponse<Delivery>> =>
    httpClient.get<PaginatedData<Delivery>>("/deliveries", { params }),
  getDeliveryById: (id: string) => httpClient.get<Delivery>(`/deliveries/${id}`),
  getDeliveryHistory: (id: string) => httpClient.get<DeliveryStatusHistoryItem[]>(`/deliveries/${id}/history`),
  updateDeliveryStatus: (id: string, status: DeliveryStatus, note?: string) => httpClient.patch<Delivery>(`/deliveries/${id}/status`, { status, note }),
  submitPod: (id: string, podData: any) => httpClient.post<Delivery>(`/deliveries/${id}/pod`, podData),
};

const apiDispatchService = {
  getAssignments: () => httpClient.get<DriverAssignment[]>("/dispatch/assignments"),
  assignDelivery: (deliveryId: string, driverId: string, vehicleId: string, assignmentType?: AssignmentType) =>
    httpClient.post<DriverAssignment>("/dispatch/assign", { deliveryId, driverId, vehicleId, assignmentType }),
  autoDispatchBatch: () =>
    httpClient.post<{ assignedCount: number; assignments: any[]; message: string }>("/dispatch/auto-batch"),
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
  getRouteTemplates: () => httpClient.get<import("@/mocks/data/routeTemplates").RouteTemplate[]>("/routes/templates"),
  createRouteTemplate: (data: any) => httpClient.post<import("@/mocks/data/routeTemplates").RouteTemplate>("/routes/templates", data),
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

  // ==========================================
  // WMS SCANNER KIOSK API ENDPOINTS
  // ==========================================
  getDockScanSessions: (params?: { warehouseId?: string }) =>
    httpClient.get<any[]>("/wms/scanner/dock-sessions", { params }),

  scanDockItem: (payload: { warehouseId: string; dispatchCode: string; barcode: string; scannedBy?: string }) =>
    httpClient.post<any>("/wms/scanner/scan-dock", payload),

  scanInboundItem: (payload: any) =>
    httpClient.post<any>("/wms/scanner/scan-inbound", payload),

  lookupBarcode: (barcode: string, params?: { warehouseId?: string }) =>
    httpClient.get<any>(`/wms/scanner/lookup/${encodeURIComponent(barcode)}`, { params }),
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
  scanAndSendDebtReminders: () =>
    httpClient.post<{
      success: boolean;
      scannedCount: number;
      remindedCount: number;
      totalOverdueAmount: number;
      categories: any;
    }>("/finance/debt-collection/scan-and-remind"),
  sendSingleInvoiceReminder: (id: string) =>
    httpClient.post<{ success: boolean; message: string; portalUrl: string }>(`/finance/invoices/${id}/send-reminder`),
  getPublicInvoice: (invoiceCode: string) =>
    httpClient.get<any>(`/public/portal/invoices/${encodeURIComponent(invoiceCode)}`),
  simulatePublicInvoicePayment: (invoiceCode: string, data?: { paymentMethod?: string; transactionRef?: string }) =>
    httpClient.post<any>(`/public/portal/invoices/${encodeURIComponent(invoiceCode)}/pay`, data),
};


const apiInternationalService = {
  getShipments: (params?: import("@/modules/international/types/international").InternationalFilterParams) =>
    httpClient.get<import("@/modules/international/types/international").InternationalShipment[]>("/international/shipments", { params }),
  getShipmentById: (id: string) =>
    httpClient.get<import("@/modules/international/types/international").InternationalShipment>(`/international/shipments/${id}`),
  createShipment: (data: import("@/modules/international/types/international").CreateShipmentInput) =>
    httpClient.post<import("@/modules/international/types/international").InternationalShipment>("/international/shipments", data),
  updateShipment: (id: string, data: Partial<import("@/modules/international/types/international").CreateShipmentInput>) =>
    httpClient.put<import("@/modules/international/types/international").InternationalShipment>(`/international/shipments/${id}`, data),
  deleteShipment: (id: string) =>
    httpClient.delete<{ success: boolean; message?: string }>(`/international/shipments/${id}`),
  getCustomsDeclarations: (params?: { channel?: string; status?: string; search?: string }) =>
    httpClient.get<import("@/modules/international/types/international").CustomsDeclaration[]>("/international/customs", { params }),
  createCustomsDeclaration: (data: import("@/modules/international/types/international").CreateCustomsInput) =>
    httpClient.post<import("@/modules/international/types/international").CustomsDeclaration>("/international/customs", data),
  updateCustomsStatus: (id: string, status: string) =>
    httpClient.patch<import("@/modules/international/types/international").CustomsDeclaration>(`/international/customs/${id}/status`, { status }),
  getContainers: () =>
    httpClient.get<import("@/modules/international/types/international").ContainerTrackingItem[]>("/international/containers"),
  getPorts: () =>
    httpClient.get<import("@/modules/international/types/international").InternationalPort[]>("/international/ports"),
  getExchangeRates: () =>
    httpClient.get<import("@/modules/international/types/international").ExchangeRateItem[]>("/international/exchange-rates"),
  getLocalCharges: () =>
    httpClient.get<import("@/modules/international/types/international").LocalChargeItem[]>("/international/local-charges"),
  searchHsCodes: (q?: string) =>
    httpClient.get<import("@/modules/international/types/international").HsCodeItem[]>("/international/hs-codes", { params: { q } }),
  calculateFtaTaxes: (dto: { hsCode: string; invoiceValue: number; currency: string; originFta?: string }) =>
    httpClient.post<import("@/modules/international/types/international").FtaTaxCalculationResult>("/international/hs-codes/calculate", dto),
  getShipmentFinancials: () =>
    httpClient.get<import("@/modules/international/types/international").ShipmentFinancialPnl[]>("/international/financials"),
  getContainerDeposits: () =>
    httpClient.get<import("@/modules/international/types/international").ContainerDepositItem[]>("/international/container-deposits"),
  refundContainerDeposit: (
    id: string,
    dto: { status: 'REFUNDED_FULL' | 'DEDUCTED_REPAIR'; refundedAmountVnd?: number; deductedReason?: string }
  ) =>
    httpClient.patch<import("@/modules/international/types/international").ContainerDepositItem>(`/international/container-deposits/${id}/refund`, dto),
  getVesselTracking: () =>
    httpClient.get<import("@/modules/international/types/international").VesselAisTrackingItem[]>("/international/vessel-tracking"),
  getShippingDocuments: (shipmentCode?: string) =>
    httpClient.get<import("@/modules/international/types/international").ShippingDocument[]>("/international/documents", { params: { shipmentCode } }),
  verifyShippingDocument: (
    id: string,
    dto: { status: 'VERIFIED' | 'REJECTED'; verificationNotes?: string }
  ) =>
    httpClient.patch<import("@/modules/international/types/international").ShippingDocument>(`/international/documents/${id}/verify`, dto),
  getDrayageDispatches: (shipmentCode?: string) =>
    httpClient.get<import("@/modules/international/types/international").ContainerDrayageDispatchItem[]>("/international/drayage-dispatches", { params: { shipmentCode } }),
  createDrayageDispatch: (dto: any) =>
    httpClient.post<import("@/modules/international/types/international").ContainerDrayageDispatchItem>("/international/drayage-dispatches", dto),
  updateDrayageStatus: (id: string, status: string) =>
    httpClient.patch<import("@/modules/international/types/international").ContainerDrayageDispatchItem>(`/international/drayage-dispatches/${id}/status`, { status }),
  getAiImportAnalysis: (shipmentCode: string) =>
    httpClient.get<import("@/modules/international/types/international").AiImportAnalysisReport>(`/international/ai-analysis/${shipmentCode}`),
  runAiAutoDispatch: (shipmentCode: string) =>
    httpClient.post<{ dispatch: import("@/modules/international/types/international").ContainerDrayageDispatchItem; analysis: import("@/modules/international/types/international").AiImportAnalysisReport }>(`/international/ai-auto-dispatch/${shipmentCode}`),
  createShippingDocument: (dto: Partial<import("@/modules/international/types/international").ShippingDocument>) =>
    httpClient.post<import("@/modules/international/types/international").ShippingDocument>("/international/documents", dto),
  deleteShippingDocument: (id: string) =>
    httpClient.delete<boolean>(`/international/documents/${id}`),
  createLocalCharge: (dto: import("@/modules/international/types/international").LocalChargeItem) =>
    httpClient.post<import("@/modules/international/types/international").LocalChargeItem>("/international/local-charges", dto),
  updateExchangeRates: (rates: import("@/modules/international/types/international").ExchangeRateItem[]) =>
    httpClient.put<import("@/modules/international/types/international").ExchangeRateItem[]>("/international/exchange-rates", rates),
};


// ==========================================
// 2. EXPORT 100% REAL BACKEND SERVICES (KHÔNG DÙNG MOCK)
// ==========================================
export const authService = apiAuthService;
export const userService = apiUserService;
export const driverService = apiDriverService;
export const vehicleService = apiVehicleService;
export const warehouseService = apiWarehouseService;
export const orderService = apiOrderService;
export const deliveryService = apiDeliveryService;
export const dispatchService = apiDispatchService;
export const routeService = apiRouteService;
export const notificationService = apiNotificationService;
export const analyticsService = apiAnalyticsService;
export const customerService = apiCustomerService;
export const inventoryService = apiInventoryService;
export const incidentService = apiIncidentService;
export const financeService = apiFinanceService;
export const departmentService = apiDepartmentService;
export const internationalService = apiInternationalService;

export interface UploadResponse {
  url: string;
  relativePath: string;
  filename: string;
  originalName?: string;
  mimetype?: string;
  size?: number;
  uploadedAt: string;
}

export const uploadService = {
  uploadFile: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await httpClient.post<UploadResponse>("/uploads", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },
  uploadBase64: async (base64Data: string, prefix?: string): Promise<UploadResponse> => {
    const res = await httpClient.post<UploadResponse>("/uploads/base64", {
      data: base64Data,
      prefix,
    });
    return res.data;
  },
};


