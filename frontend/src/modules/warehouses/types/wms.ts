/**
 * WMS — Xuất Nhập Kho & Quản Lý Tồn Kho
 */

export type InboundStatus = "PENDING" | "RECEIVING" | "INSPECTING" | "COMPLETED" | "REJECTED";
export type OutboundStatus = "PENDING" | "PICKING" | "PACKING" | "DISPATCHED" | "COMPLETED";
export type TransferStatus = "PENDING" | "IN_TRANSIT" | "RECEIVED" | "CANCELLED";

export interface InboundReceipt {
  id: string;
  receiptCode: string;
  warehouseId: string;
  supplierName: string;
  itemCount: number;
  totalWeight: number; // kg
  status: InboundStatus;
  receivedBy: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface OutboundDispatch {
  id: string;
  dispatchCode: string;
  warehouseId: string;
  orderId?: string;
  orderCode?: string;
  routeCode?: string;
  itemCount: number;
  totalWeight: number; // kg
  status: OutboundStatus;
  pickedBy: string;
  notes?: string;
  createdAt: string;
  completedAt?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  productName: string;
  warehouseId: string;
  zoneCode: string;
  quantity: number;
  reservedQuantity: number;
  unit: string;
  weightPerUnit: number; // kg
  minStockLevel: number;
  lastUpdated: string;
}

export interface StockTransfer {
  id: string;
  transferCode: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  itemCount: number;
  totalWeight: number;
  status: TransferStatus;
  createdBy: string;
  createdAt: string;
  completedAt?: string;
}

export type ActivityType = "INBOUND" | "OUTBOUND" | "TRANSFER" | "ADJUSTMENT" | "INSPECTION";

export interface WarehouseActivity {
  id: string;
  warehouseId: string;
  type: ActivityType;
  description: string;
  user: string;
  referenceCode: string;
  quantity?: number;
  createdAt: string;
}
