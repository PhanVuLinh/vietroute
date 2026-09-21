import type { ApiResponse } from "@/core/types/api";
import type {
  InboundReceipt,
  OutboundDispatch,
  InventoryItem,
  StockTransfer,
  WarehouseActivity,
} from "@/modules/warehouses/types/wms";
import {
  MOCK_INBOUND_RECEIPTS,
  MOCK_OUTBOUND_DISPATCHES,
  MOCK_INVENTORY,
  MOCK_STOCK_TRANSFERS,
  MOCK_WAREHOUSE_ACTIVITIES,
} from "../data/inventory";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";

const KEYS = {
  INBOUNDS: "vietroute_mock_inbounds",
  OUTBOUNDS: "vietroute_mock_outbounds",
  INVENTORY: "vietroute_mock_inventory",
  TRANSFERS: "vietroute_mock_transfers",
  ACTIVITIES: "vietroute_mock_activities",
};

function loadStored<T>(key: string, fallback: T): T {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key);
      if (item) return JSON.parse(item);
    } catch (e) {
      console.warn(`Failed to load ${key} from localStorage`, e);
    }
  }
  return fallback;
}

function saveStored<T>(key: string, data: T): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.warn(`Failed to save ${key} to localStorage`, e);
    }
  }
}

let inbounds: InboundReceipt[] = loadStored(KEYS.INBOUNDS, [...MOCK_INBOUND_RECEIPTS]);
let outbounds: OutboundDispatch[] = loadStored(KEYS.OUTBOUNDS, [...MOCK_OUTBOUND_DISPATCHES]);
let inventory: InventoryItem[] = loadStored(KEYS.INVENTORY, [...MOCK_INVENTORY]);
let transfers: StockTransfer[] = loadStored(KEYS.TRANSFERS, [...MOCK_STOCK_TRANSFERS]);
let activities: WarehouseActivity[] = loadStored(KEYS.ACTIVITIES, [...MOCK_WAREHOUSE_ACTIVITIES]);

export const mockInventoryService = {
  async getInboundReceipts(
    params?: { warehouseId?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<InboundReceipt[]>> {
    await simulateLatency(options);
    let result = [...inbounds];
    if (params?.warehouseId) {
      result = result.filter((r) => r.warehouseId === params.warehouseId);
    }
    return { success: true, statusCode: 200, message: "OK", data: result };
  },

  async getOutboundDispatches(
    params?: { warehouseId?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<OutboundDispatch[]>> {
    await simulateLatency(options);
    let result = [...outbounds];
    if (params?.warehouseId) {
      result = result.filter((r) => r.warehouseId === params.warehouseId);
    }
    return { success: true, statusCode: 200, message: "OK", data: result };
  },

  async getInventory(
    params?: { warehouseId?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<InventoryItem[]>> {
    await simulateLatency(options);
    let result = [...inventory];
    if (params?.warehouseId) {
      result = result.filter((r) => r.warehouseId === params.warehouseId);
    }
    return { success: true, statusCode: 200, message: "OK", data: result };
  },

  async getStockTransfers(
    params?: { warehouseId?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<StockTransfer[]>> {
    await simulateLatency(options);
    let result = [...transfers];
    if (params?.warehouseId) {
      result = result.filter(
        (r) => r.fromWarehouseId === params.warehouseId || r.toWarehouseId === params.warehouseId
      );
    }
    return { success: true, statusCode: 200, message: "OK", data: result };
  },

  async getActivityLog(
    params?: { warehouseId?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<WarehouseActivity[]>> {
    await simulateLatency(options);
    let result = [...activities];
    if (params?.warehouseId) {
      result = result.filter((r) => r.warehouseId === params.warehouseId);
    }
    result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return { success: true, statusCode: 200, message: "OK", data: result };
  },

  async createInboundReceipt(
    data: Omit<InboundReceipt, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<InboundReceipt>> {
    await simulateLatency(options);
    const newReceipt: InboundReceipt = { ...data, id: `inb-${Date.now()}` };
    inbounds.unshift(newReceipt);
    saveStored(KEYS.INBOUNDS, inbounds);

    // Auto-record activity
    const newAct: WarehouseActivity = {
      id: `act-${Date.now()}`,
      warehouseId: data.warehouseId,
      type: "INBOUND",
      description: `Nhập kho từ ${data.supplierName} (${data.itemCount} kiện)`,
      user: data.receivedBy,
      referenceCode: data.receiptCode,
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newAct);
    saveStored(KEYS.ACTIVITIES, activities);

    return { success: true, statusCode: 201, message: "Tạo phiếu nhập thành công", data: newReceipt };
  },

  async createOutboundDispatch(
    data: Omit<OutboundDispatch, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<OutboundDispatch>> {
    await simulateLatency(options);
    const newDispatch: OutboundDispatch = { ...data, id: `out-${Date.now()}` };
    outbounds.unshift(newDispatch);
    saveStored(KEYS.OUTBOUNDS, outbounds);

    const newAct: WarehouseActivity = {
      id: `act-${Date.now()}`,
      warehouseId: data.warehouseId,
      type: "OUTBOUND",
      description: `Xuất kho đơn ${data.orderCode || data.dispatchCode} (${data.itemCount} kiện)`,
      user: data.pickedBy,
      referenceCode: data.dispatchCode,
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newAct);
    saveStored(KEYS.ACTIVITIES, activities);

    return { success: true, statusCode: 201, message: "Tạo phiếu xuất thành công", data: newDispatch };
  },

  async createStockTransfer(
    data: Omit<StockTransfer, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<StockTransfer>> {
    await simulateLatency(options);
    const newTransfer: StockTransfer = { ...data, id: `tf-${Date.now()}` };
    transfers.unshift(newTransfer);
    saveStored(KEYS.TRANSFERS, transfers);

    const newAct: WarehouseActivity = {
      id: `act-${Date.now()}`,
      warehouseId: data.fromWarehouseId,
      type: "TRANSFER",
      description: `Điều chuyển tới ${data.toWarehouseName} (${data.itemCount} kiện)`,
      user: data.createdBy,
      referenceCode: data.transferCode,
      createdAt: new Date().toISOString(),
    };
    activities.unshift(newAct);
    saveStored(KEYS.ACTIVITIES, activities);

    return { success: true, statusCode: 201, message: "Tạo phiếu luân chuyển thành công", data: newTransfer };
  },
};
