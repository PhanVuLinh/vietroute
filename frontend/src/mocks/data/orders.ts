import type { Order, OrderItem, OrderPriority, OrderStatus } from "@/core/types/logistics";
import { MOCK_CUSTOMERS } from "./customers";
import { MOCK_WAREHOUSES } from "./warehouses";

// Danh mục sản phẩm mẫu để sinh các order items thực tế
const SAMPLE_PRODUCTS = [
  { name: "Thùng Sữa Tươi Tiệt Trùng TH True Milk", weight: 12.0, volume: 0.035, isFragile: false, isLiquid: true, requiresSpecialHandling: false },
  { name: "Tivi Thông Minh Sony Bravia 55 Inch 4K", weight: 18.5, volume: 0.18, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
  { name: "Thùng Dầu Ăn Cao Cấp Neptune 5L (4 can)", weight: 19.2, volume: 0.045, isFragile: false, isLiquid: true, requiresSpecialHandling: false },
  { name: "Kiện Linh Kiện Máy Tính & Bo Mạch Chủ", weight: 8.5, volume: 0.06, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
  { name: "Thùng Dược Phẩm Kháng Sinh Kháng Viêm", weight: 6.0, volume: 0.025, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
  { name: "Bao Gạo Nàng Thơm Chợ Đào 25kg", weight: 25.0, volume: 0.04, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
  { name: "Thùng Bia Sài Gòn Special (24 lon)", weight: 8.8, volume: 0.022, isFragile: false, isLiquid: true, requiresSpecialHandling: false },
  { name: "Bộ Bàn Ghế Văn Phòng Lắp Ráp Hòa Phát", weight: 35.0, volume: 0.35, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
  { name: "Thùng Bánh Kẹo Tết Kinh Đô Cao Cấp", weight: 5.5, volume: 0.03, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
  { name: "Máy Giặt Inverter Electrolux 10kg", weight: 72.0, volume: 0.48, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
  { name: "Kiện Sách Giáo Trình & Văn Phòng Phẩm", weight: 15.0, volume: 0.05, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
  { name: "Thùng Nước Tẩy Rửa Đa Năng Sunlight", weight: 16.0, volume: 0.038, isFragile: false, isLiquid: true, requiresSpecialHandling: false },
  { name: "Cuộn Cáp Điện Chống Cháy Cadivi 100m", weight: 28.0, volume: 0.065, isFragile: false, isLiquid: false, requiresSpecialHandling: false },
  { name: "Thùng Hải Sản Đông Lạnh Đóng Khay", weight: 20.0, volume: 0.055, isFragile: false, isLiquid: false, requiresSpecialHandling: true },
  { name: "Lốc Máy Lọc Nước RO Karofi 9 Lõi", weight: 32.0, volume: 0.22, isFragile: true, isLiquid: false, requiresSpecialHandling: true },
];

const ORDER_STATUS_LIST: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "ASSIGNED",
  "PICKING_UP",
  "IN_TRANSIT",
  "DELIVERED",
  "DELIVERED",
  "DELIVERED",
  "FAILED",
  "CANCELLED",
];

const PRIORITY_LIST: OrderPriority[] = ["NORMAL", "NORMAL", "HIGH", "URGENT", "LOW"];

// Hàm sinh 50 đơn hàng đảm bảo ràng buộc toàn vẹn dữ liệu
function generateMockOrders(): Order[] {
  const orders: Order[] = [];

  for (let i = 1; i <= 50; i++) {
    const paddedId = i.toString().padStart(3, "0");
    const orderCode = `VR-2026-${paddedId}`;
    const customer = MOCK_CUSTOMERS[(i - 1) % MOCK_CUSTOMERS.length];
    
    // Gán kho xuất phát tương ứng với thành phố của khách
    let warehouse = MOCK_WAREHOUSES[0]; // Mặc định Long Biên
    if (customer.address.includes("Hồ Chí Minh") || customer.address.includes("Tân Bình")) {
      warehouse = MOCK_WAREHOUSES[2]; // Kho Cát Lái
    } else if (customer.address.includes("Đà Nẵng")) {
      warehouse = MOCK_WAREHOUSES[4]; // Kho Hòa Cầm
    } else if (customer.address.includes("Quảng Ngãi")) {
      warehouse = MOCK_WAREHOUSES[5]; // Kho Quảng Ngãi
    } else if (customer.address.includes("Cần Thơ")) {
      warehouse = MOCK_WAREHOUSES[6]; // Kho Cần Thơ
    }

    // Sinh 1 đến 4 mặt hàng
    const itemCount = 1 + ((i * 3) % 4);
    const items: OrderItem[] = [];
    let totalWeight = 0;
    let totalVolume = 0;

    for (let j = 0; j < itemCount; j++) {
      const prod = SAMPLE_PRODUCTS[(i + j * 4) % SAMPLE_PRODUCTS.length];
      const qty = 1 + ((i + j) % 3);
      const itemWeight = Math.round(prod.weight * qty * 10) / 10;
      const itemVolume = Math.round(prod.volume * qty * 1000) / 1000;

      totalWeight += itemWeight;
      totalVolume += itemVolume;

      items.push({
        id: `item-${paddedId}-${j + 1}`,
        orderId: `ord-${paddedId}`,
        productName: prod.name,
        quantity: qty,
        weight: itemWeight,
        volume: itemVolume,
        isFragile: prod.isFragile,
        isLiquid: prod.isLiquid,
        requiresSpecialHandling: prod.requiresSpecialHandling,
      });
    }

    const priority = PRIORITY_LIST[i % PRIORITY_LIST.length];
    const status = ORDER_STATUS_LIST[(i * 7) % ORDER_STATUS_LIST.length];
    
    // Tiền thu hộ COD (0 VNĐ đối với doanh nghiệp, hoặc từ 250.000 đến 4.500.000 VNĐ với cá nhân)
    const codAmount = customer.type === "ENTERPRISE" ? 0 : (i % 5 === 0 ? 0 : (150 + (i * 45) % 3500) * 1000);

    const baseHour = 8 + (i % 8);
    const dateStr = `2026-09-0${Math.min(6, 1 + (i % 6))}`;

    orders.push({
      id: `ord-${paddedId}`,
      orderCode,
      customerId: customer.id,
      warehouseId: warehouse.id,
      receiverName: customer.type === "INDIVIDUAL" ? customer.name : `Bộ phận Kho Vận - ${customer.name}`,
      receiverPhone: customer.phone,
      receiverAddress: customer.address,
      receiverLatitude: customer.latitude,
      receiverLongitude: customer.longitude,
      totalWeight: Math.round(totalWeight * 10) / 10,
      totalVolume: Math.round(totalVolume * 1000) / 1000,
      codAmount,
      priority,
      deliveryWindowStart: `${dateStr}T${baseHour.toString().padStart(2, "0")}:00:00Z`,
      deliveryWindowEnd: `${dateStr}T${(baseHour + 3).toString().padStart(2, "0")}:30:00Z`,
      status,
      createdAt: `2026-09-05T${(baseHour - 2).toString().padStart(2, "0")}:15:00Z`,
      updatedAt: `2026-09-06T${baseHour.toString().padStart(2, "0")}:30:00Z`,
      items,
    });
  }

  return orders;
}

export const MOCK_ORDERS: Order[] = generateMockOrders();
