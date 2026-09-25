export interface ExpectedPackage {
  barcode: string;
  index: number;
  total: number;
  name: string;
  weight: number;
  isScanned: boolean;
}

export interface DockScanSession {
  dispatchCode: string;
  warehouseId: string;
  warehouseName: string;
  warehouseCode: string;
  orderCode?: string;
  routeCode?: string;
  customerName: string;
  deliveryAddress: string;
  status: string;
  pickedBy: string;
  totalPackages: number;
  totalWeight: number;
  scannedCount: number;
  progressPercent: number;
  isComplete: boolean;
  expectedPackages: ExpectedPackage[];
  createdAt: string;
}

export interface DockScanResult {
  success: boolean;
  reason?: 'WRONG_VEHICLE' | 'ALREADY_SCANNED' | 'UNKNOWN_BARCODE' | 'DISPATCH_NOT_FOUND';
  barcode: string;
  dispatchCode?: string;
  orderCode?: string;
  correctOrderCode?: string;
  correctDispatchCode?: string;
  customerName?: string;
  scannedCount?: number;
  totalCount?: number;
  progressPercent?: number;
  isComplete?: boolean;
  message: string;
}

export interface InboundScanPayload {
  warehouseId: string;
  receiptCode?: string;
  barcode: string;
  sku?: string;
  productName?: string;
  zoneCode: string;
  quantity?: number;
  unit?: string;
  weightPerUnit?: number;
  scannedBy?: string;
}

export interface InboundScanResult {
  success: boolean;
  barcode: string;
  sku: string;
  productName: string;
  zoneCode: string;
  quantityAdded: number;
  newTotalQuantity: number;
  unit: string;
  message: string;
}

export interface BarcodeLookupResult {
  found: boolean;
  type?: 'INVENTORY_SKU' | 'ORDER_PACKAGE' | 'OUTBOUND_DISPATCH';
  barcode: string;
  title?: string;
  code?: string;
  warehouseName?: string;
  zoneCode?: string;
  quantity?: number;
  unit?: string;
  weight?: number;
  status?: string;
  details?: Record<string, any>;
  message?: string;
}
