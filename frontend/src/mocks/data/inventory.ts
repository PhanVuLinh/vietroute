import type {
  InboundReceipt,
  OutboundDispatch,
  InventoryItem,
  StockTransfer,
  WarehouseActivity,
} from "@/modules/warehouses/types/wms";

export const MOCK_INBOUND_RECEIPTS: InboundReceipt[] = [
  { id: "inb-01", receiptCode: "INB-2026-001", warehouseId: "wh-hn-lb", supplierName: "Công ty TNHH Bao bì Miền Bắc", itemCount: 45, totalWeight: 2800, status: "COMPLETED", receivedBy: "Trần Văn Hùng", createdAt: "2026-09-19T08:15:00Z", completedAt: "2026-09-19T10:30:00Z" },
  { id: "inb-02", receiptCode: "INB-2026-002", warehouseId: "wh-hcm-cl", supplierName: "Công ty CP Thực phẩm Sài Gòn", itemCount: 120, totalWeight: 5600, status: "RECEIVING", receivedBy: "Nguyễn Thị Mai", createdAt: "2026-09-20T07:00:00Z" },
  { id: "inb-03", receiptCode: "INB-2026-003", warehouseId: "wh-hn-lb", supplierName: "Nhà máy Thép Hòa Phát", itemCount: 30, totalWeight: 12000, status: "INSPECTING", receivedBy: "Lê Quốc Tuấn", createdAt: "2026-09-20T06:30:00Z" },
  { id: "inb-04", receiptCode: "INB-2026-004", warehouseId: "wh-dad-hc", supplierName: "Kho nông sản Đà Nẵng", itemCount: 80, totalWeight: 3200, status: "PENDING", receivedBy: "Võ Thanh Tùng", createdAt: "2026-09-20T09:00:00Z" },
  { id: "inb-05", receiptCode: "INB-2026-005", warehouseId: "wh-hcm-tb", supplierName: "Công ty Dược phẩm Sanofi VN", itemCount: 200, totalWeight: 1500, status: "COMPLETED", receivedBy: "Phạm Thị Hoa", notes: "Hàng bảo quản lạnh 2-8°C", createdAt: "2026-09-18T14:00:00Z", completedAt: "2026-09-18T16:45:00Z" },
];

export const MOCK_OUTBOUND_DISPATCHES: OutboundDispatch[] = [
  { id: "out-01", dispatchCode: "OUT-2026-001", warehouseId: "wh-hn-lb", orderCode: "VR-2026-003", itemCount: 12, totalWeight: 850, status: "DISPATCHED", pickedBy: "Đặng Văn Minh", createdAt: "2026-09-20T07:30:00Z" },
  { id: "out-02", dispatchCode: "OUT-2026-002", warehouseId: "wh-hcm-cl", orderCode: "VR-2026-009", routeCode: "TUYEN-SGN-04", itemCount: 35, totalWeight: 2200, status: "PICKING", pickedBy: "Trần Minh Đức", createdAt: "2026-09-20T08:00:00Z" },
  { id: "out-03", dispatchCode: "OUT-2026-003", warehouseId: "wh-hn-lb", orderCode: "VR-2026-015", itemCount: 8, totalWeight: 420, status: "COMPLETED", pickedBy: "Lê Văn Bình", createdAt: "2026-09-19T15:00:00Z", completedAt: "2026-09-19T16:30:00Z" },
  { id: "out-04", dispatchCode: "OUT-2026-004", warehouseId: "wh-dad-hc", orderCode: "VR-2026-045", itemCount: 20, totalWeight: 1100, status: "PACKING", pickedBy: "Nguyễn Hoàng Nam", createdAt: "2026-09-20T09:15:00Z" },
];

export const MOCK_INVENTORY: InventoryItem[] = [
  { id: "inv-01", sku: "SKU-BBI-001", productName: "Thùng carton 60x40x40", warehouseId: "wh-hn-lb", zoneCode: "ZONE-A", quantity: 1500, reservedQuantity: 120, unit: "thùng", weightPerUnit: 0.8, minStockLevel: 200, lastUpdated: "2026-09-20T08:00:00Z" },
  { id: "inv-02", sku: "SKU-TP-012", productName: "Sữa Vinamilk 1L (lốc 12)", warehouseId: "wh-hcm-cl", zoneCode: "ZONE-COLD", quantity: 800, reservedQuantity: 50, unit: "lốc", weightPerUnit: 12.5, minStockLevel: 100, lastUpdated: "2026-09-20T07:45:00Z" },
  { id: "inv-03", sku: "SKU-DT-005", productName: "Laptop Dell Vostro 3520", warehouseId: "wh-hn-lb", zoneCode: "ZONE-B", quantity: 45, reservedQuantity: 10, unit: "chiếc", weightPerUnit: 2.1, minStockLevel: 10, lastUpdated: "2026-09-19T16:00:00Z" },
  { id: "inv-04", sku: "SKU-NS-022", productName: "Gạo ST25 5kg", warehouseId: "wh-hcm-tb", zoneCode: "ZONE-A", quantity: 3200, reservedQuantity: 400, unit: "bao", weightPerUnit: 5.0, minStockLevel: 500, lastUpdated: "2026-09-20T06:30:00Z" },
  { id: "inv-05", sku: "SKU-DC-008", productName: "Thuốc Paracetamol 500mg", warehouseId: "wh-hcm-cl", zoneCode: "ZONE-COLD", quantity: 5000, reservedQuantity: 200, unit: "hộp", weightPerUnit: 0.15, minStockLevel: 1000, lastUpdated: "2026-09-18T14:00:00Z" },
  { id: "inv-06", sku: "SKU-VL-015", productName: "Xi măng Hà Tiên PCB40", warehouseId: "wh-dad-hc", zoneCode: "ZONE-A", quantity: 180, reservedQuantity: 30, unit: "bao", weightPerUnit: 50.0, minStockLevel: 50, lastUpdated: "2026-09-20T09:00:00Z" },
  { id: "inv-07", sku: "SKU-TP-033", productName: "Nước mắm Phú Quốc 500ml", warehouseId: "wh-hcm-tb", zoneCode: "ZONE-A", quantity: 60, reservedQuantity: 20, unit: "thùng", weightPerUnit: 6.5, minStockLevel: 80, lastUpdated: "2026-09-19T11:00:00Z" },
  { id: "inv-08", sku: "SKU-BBI-009", productName: "Màng co PE 50cm", warehouseId: "wh-hn-lb", zoneCode: "ZONE-C", quantity: 350, reservedQuantity: 0, unit: "cuộn", weightPerUnit: 3.2, minStockLevel: 50, lastUpdated: "2026-09-17T09:00:00Z" },
];

export const MOCK_STOCK_TRANSFERS: StockTransfer[] = [
  { id: "tf-01", transferCode: "TF-2026-001", fromWarehouseId: "wh-hcm-cl", fromWarehouseName: "Kho Cát Lái", toWarehouseId: "wh-hcm-tb", toWarehouseName: "Kho Tân Bình", itemCount: 50, totalWeight: 2500, status: "IN_TRANSIT", createdBy: "Admin TMS", createdAt: "2026-09-20T07:00:00Z" },
  { id: "tf-02", transferCode: "TF-2026-002", fromWarehouseId: "wh-hn-lb", fromWarehouseName: "Kho Long Biên", toWarehouseId: "wh-dad-hc", toWarehouseName: "Kho Hòa Cầm", itemCount: 25, totalWeight: 8000, status: "PENDING", createdBy: "Dispatcher Minh", createdAt: "2026-09-20T08:30:00Z" },
  { id: "tf-03", transferCode: "TF-2026-003", fromWarehouseId: "wh-hcm-tb", fromWarehouseName: "Kho Tân Bình", toWarehouseId: "wh-hcm-cl", toWarehouseName: "Kho Cát Lái", itemCount: 100, totalWeight: 1200, status: "RECEIVED", createdBy: "Admin TMS", createdAt: "2026-09-18T10:00:00Z", completedAt: "2026-09-19T14:00:00Z" },
];

export const MOCK_WAREHOUSE_ACTIVITIES: WarehouseActivity[] = [
  { id: "act-01", warehouseId: "wh-hn-lb", type: "INBOUND", description: "Nhập kho 45 thùng hàng từ Bao bì Miền Bắc", user: "Trần Văn Hùng", referenceCode: "INB-2026-001", quantity: 45, createdAt: "2026-09-19T10:30:00Z" },
  { id: "act-02", warehouseId: "wh-hcm-cl", type: "OUTBOUND", description: "Xuất kho 12 đơn cho tuyến TUYEN-SGN-04", user: "Đặng Văn Minh", referenceCode: "OUT-2026-001", quantity: 12, createdAt: "2026-09-20T07:30:00Z" },
  { id: "act-03", warehouseId: "wh-hcm-cl", type: "TRANSFER", description: "Chuyển 50 mặt hàng sang Kho Tân Bình", user: "Admin TMS", referenceCode: "TF-2026-001", quantity: 50, createdAt: "2026-09-20T07:00:00Z" },
  { id: "act-04", warehouseId: "wh-hn-lb", type: "INSPECTION", description: "Kiểm kê khu vực ZONE-A, chênh lệch 3 đơn vị", user: "Lê Quốc Tuấn", referenceCode: "CHK-2026-001", quantity: 3, createdAt: "2026-09-20T06:30:00Z" },
  { id: "act-05", warehouseId: "wh-hcm-tb", type: "ADJUSTMENT", description: "Điều chỉnh tồn kho Nước mắm Phú Quốc: -20 thùng (hỏng)", user: "Phạm Thị Hoa", referenceCode: "ADJ-2026-001", quantity: -20, createdAt: "2026-09-19T11:00:00Z" },
  { id: "act-06", warehouseId: "wh-dad-hc", type: "INBOUND", description: "Nhập kho nông sản Đà Nẵng - chờ kiểm tra", user: "Võ Thanh Tùng", referenceCode: "INB-2026-004", quantity: 80, createdAt: "2026-09-20T09:00:00Z" },
  { id: "act-07", warehouseId: "wh-hcm-cl", type: "INBOUND", description: "Nhập kho thực phẩm từ Sài Gòn Food - đang nhận", user: "Nguyễn Thị Mai", referenceCode: "INB-2026-002", quantity: 120, createdAt: "2026-09-20T07:00:00Z" },
  { id: "act-08", warehouseId: "wh-hn-lb", type: "OUTBOUND", description: "Xuất kho đơn VR-2026-015 - hoàn tất", user: "Lê Văn Bình", referenceCode: "OUT-2026-003", quantity: 8, createdAt: "2026-09-19T16:30:00Z" },
];
