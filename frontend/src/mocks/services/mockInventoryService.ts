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

  // ==========================================
  // WMS SCANNER KIOSK MOCK METHODS
  // ==========================================
  async getDockScanSessions(
    params?: { warehouseId?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<any[]>> {
    await simulateLatency(options);
    let list = [...outbounds];
    if (params?.warehouseId) {
      list = list.filter((o) => o.warehouseId === params.warehouseId);
    }

    const sessions = list.slice(0, 10).map((d) => {
      const orderCode = d.orderCode || `VR-ORD-${d.dispatchCode.slice(-4)}`;
      const totalPackages = d.itemCount || 3;
      const expectedPackages = [];
      for (let i = 1; i <= totalPackages; i++) {
        expectedPackages.push({
          barcode: `PKG-${orderCode}-${i.toString().padStart(2, "0")}`,
          index: i,
          total: totalPackages,
          name: `Kiện hàng #${i}/${totalPackages} - Đơn ${orderCode}`,
          weight: Math.round(((d.totalWeight || 15) / totalPackages) * 10) / 10,
          isScanned: d.status === "DISPATCHED" || d.status === "COMPLETED",
        });
      }

      return {
        dispatchCode: d.dispatchCode,
        warehouseId: d.warehouseId,
        warehouseName: "Kho Tổng Logistics",
        warehouseCode: "WH-NORTH",
        orderCode: d.orderCode,
        routeCode: d.routeCode,
        customerName: "Công ty Cổ phần B2B Viettel / FPT",
        deliveryAddress: "Cầu Giấy, Hà Nội",
        status: d.status,
        pickedBy: d.pickedBy,
        totalPackages,
        totalWeight: d.totalWeight,
        scannedCount: d.status === "DISPATCHED" ? totalPackages : 0,
        progressPercent: d.status === "DISPATCHED" ? 100 : 0,
        isComplete: d.status === "DISPATCHED" || d.status === "COMPLETED",
        expectedPackages,
        createdAt: d.createdAt,
      };
    });

    return { success: true, statusCode: 200, message: "OK", data: sessions };
  },

  async scanDockItem(
    payload: { warehouseId: string; dispatchCode: string; barcode: string; scannedBy?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<any>> {
    await simulateLatency(options);
    const cleanBarcode = payload.barcode.trim().toUpperCase();
    const dispatch = outbounds.find((o) => o.dispatchCode === payload.dispatchCode);

    if (!dispatch) {
      return {
        success: false,
        statusCode: 404,
        message: "Không tìm thấy lệnh xuất kho",
        data: { success: false, reason: "DISPATCH_NOT_FOUND", barcode: cleanBarcode, message: "Không tìm thấy lệnh xuất" },
      };
    }

    const orderCode = dispatch.orderCode || `VR-ORD-${dispatch.dispatchCode.slice(-4)}`;
    const isMatching = cleanBarcode.includes(orderCode) || cleanBarcode === dispatch.dispatchCode;

    if (!isMatching) {
      return {
        success: true,
        statusCode: 200,
        message: "Cảnh báo nhầm kiện",
        data: {
          success: false,
          reason: "WRONG_VEHICLE",
          barcode: cleanBarcode,
          correctOrderCode: "VR-2026-999",
          message: `🚨 CẢNH BÁO NGUY HIỂM: Kiện hàng [${cleanBarcode}] KHÔNG THUỘC chuyến xe này! Thuộc về đơn hàng khác. Không được xếp lên xe!`,
        },
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "Quét thành công",
      data: {
        success: true,
        barcode: cleanBarcode,
        dispatchCode: dispatch.dispatchCode,
        orderCode: dispatch.orderCode,
        scannedCount: dispatch.itemCount,
        totalCount: dispatch.itemCount,
        progressPercent: 100,
        isComplete: true,
        message: `✅ HỢP LỆ: Kiện hàng [${cleanBarcode}] đã được bốc lên xe thành công!`,
      },
    };
  },

  async scanInboundItem(
    payload: any,
    options?: MockServiceOptions
  ): Promise<ApiResponse<any>> {
    await simulateLatency(options);
    const qty = payload.quantity || 1;
    const cleanSku = (payload.sku || payload.barcode).trim().toUpperCase();

    return {
      success: true,
      statusCode: 200,
      message: "Nhập kho thành công",
      data: {
        success: true,
        barcode: payload.barcode,
        sku: cleanSku,
        productName: payload.productName || `Hàng hóa [${cleanSku}]`,
        zoneCode: payload.zoneCode,
        quantityAdded: qty,
        newTotalQuantity: 100 + qty,
        unit: payload.unit || "kiện",
        message: `✅ Đã nhập kho ${qty} kiện vào phân khu ${payload.zoneCode}!`,
      },
    };
  },

  async lookupBarcode(
    barcode: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<any>> {
    await simulateLatency(options);
    const clean = barcode.trim().toUpperCase();

    return {
      success: true,
      statusCode: 200,
      message: "OK",
      data: {
        found: true,
        type: "ORDER_PACKAGE",
        barcode: clean,
        title: `Vận đơn bưu kiện [${clean}]`,
        code: clean,
        warehouseName: "Kho Tổng Hà Nội Hub",
        zoneCode: "Z-STAGE-01",
        quantity: 1,
        unit: "kiện",
        weight: 8.5,
        status: "READY_FOR_DISPATCH",
        details: {
          customerName: "Khách hàng Doanh nghiệp B2B",
          deliveryAddress: "Cầu Giấy, Hà Nội",
        },
      },
    };
  },
};

