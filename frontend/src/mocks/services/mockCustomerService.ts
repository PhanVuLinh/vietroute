import type { ApiResponse } from "@/core/types/api";
import type { Customer } from "@/core/types/logistics";
import { MOCK_CUSTOMERS } from "../data/customers";
import { simulateLatency, type MockServiceOptions } from "./mockUtils";
import type {
  EnrichedCustomer,
  CustomerTier,
  CustomerAddress,
  CustomerStats,
} from "@/modules/customers/types/customer";

// Enrichment data tạo sẵn cho mỗi customer
const TIERS: CustomerTier[] = ["REGULAR", "SILVER", "GOLD", "VIP"];

function generateCustomerStats(customerId: string): CustomerStats {
  const seed = customerId.charCodeAt(customerId.length - 1) + customerId.charCodeAt(customerId.length - 2);
  const totalOrders = 10 + (seed * 7) % 200;
  const failedOrders = Math.floor(totalOrders * (0.01 + (seed % 5) * 0.005));
  const completedOrders = totalOrders - failedOrders;
  const avgValue = 500000 + (seed * 13) % 5000000;
  return {
    totalOrders,
    completedOrders,
    failedOrders,
    totalRevenue: totalOrders * avgValue,
    averageOrderValue: avgValue,
    completionRate: Math.round((completedOrders / totalOrders) * 1000) / 10,
    lastOrderDate: "2026-09-15T10:30:00Z",
  };
}

function generateAddresses(customer: Customer): CustomerAddress[] {
  return [
    {
      id: `addr-${customer.id}-1`,
      label: customer.type === "ENTERPRISE" ? "Trụ sở chính" : "Nhà riêng",
      address: customer.address,
      city: customer.address.split(",").pop()?.trim() || "Việt Nam",
      latitude: customer.latitude,
      longitude: customer.longitude,
      isDefault: true,
      contactName: customer.name,
      contactPhone: customer.phone,
    },
  ];
}

function enrichCustomer(c: Customer, index: number): EnrichedCustomer {
  return {
    ...c,
    tier: TIERS[index % 4],
    taxCode: c.type === "ENTERPRISE" ? `0${100000000 + index * 37}` : undefined,
    contactPerson: c.type === "ENTERPRISE" ? `Nguyễn Văn ${String.fromCharCode(65 + (index % 26))}` : undefined,
    website: c.type === "ENTERPRISE" ? `https://${c.email.split("@")[1]}` : undefined,
    notes: undefined,
    addresses: generateAddresses(c),
    contractPricing:
      c.type === "ENTERPRISE"
        ? [
            {
              id: `price-${c.id}-1`,
              routeName: "Nội thành",
              pricePerKm: 8000 + (index * 500) % 5000,
              pricePerKg: 3000 + (index * 200) % 3000,
              minimumCharge: 150000 + (index * 10000) % 200000,
              validFrom: "2026-01-01",
              validTo: "2026-12-31",
            },
          ]
        : [],
    stats: generateCustomerStats(c.id),
    createdAt: `2025-${String(1 + (index % 12)).padStart(2, "0")}-${String(1 + (index % 28)).padStart(2, "0")}T08:00:00Z`,
  };
}

const STORAGE_KEY = "vietroute_mock_customers";

function loadCustomers(): EnrichedCustomer[] {
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Failed to load customers from localStorage", e);
    }
  }
  return MOCK_CUSTOMERS.map((c, i) => enrichCustomer(c, i));
}

function saveCustomers(list: EnrichedCustomer[]) {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn("Failed to save customers to localStorage", e);
    }
  }
}

let ENRICHED_CUSTOMERS: EnrichedCustomer[] = loadCustomers();

export const mockCustomerService = {
  async getCustomers(
    params?: { searchQuery?: string; type?: string },
    options?: MockServiceOptions
  ): Promise<ApiResponse<EnrichedCustomer[]>> {
    await simulateLatency(options);
    let result = [...ENRICHED_CUSTOMERS];

    if (params?.searchQuery) {
      const q = params.searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }

    if (params?.type && params.type !== "ALL") {
      result = result.filter((c) => c.type === params.type);
    }

    return {
      success: true,
      statusCode: 200,
      message: "Lấy danh sách khách hàng thành công",
      data: result,
    };
  },

  async getCustomerById(
    id: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<EnrichedCustomer | null>> {
    await simulateLatency(options);
    const customer = ENRICHED_CUSTOMERS.find((c) => c.id === id) || null;
    return {
      success: true,
      statusCode: 200,
      message: customer ? "Tìm thấy khách hàng" : "Không tìm thấy khách hàng",
      data: customer,
    };
  },

  async createCustomer(
    data: Omit<Customer, "id">,
    options?: MockServiceOptions
  ): Promise<ApiResponse<EnrichedCustomer>> {
    await simulateLatency(options);
    const newCustomer: Customer = { ...data, id: `cus-new-${Date.now()}` };
    const enriched = enrichCustomer(newCustomer, ENRICHED_CUSTOMERS.length);
    ENRICHED_CUSTOMERS.push(enriched);
    saveCustomers(ENRICHED_CUSTOMERS);
    return {
      success: true,
      statusCode: 201,
      message: "Tạo khách hàng thành công",
      data: enriched,
    };
  },

  async updateCustomer(
    id: string,
    data: Partial<Customer>,
    options?: MockServiceOptions
  ): Promise<ApiResponse<EnrichedCustomer | null>> {
    await simulateLatency(options);
    const index = ENRICHED_CUSTOMERS.findIndex((c) => c.id === id);
    if (index === -1) {
      return { success: false, statusCode: 404, message: "Không tìm thấy", data: null };
    }
    ENRICHED_CUSTOMERS[index] = { ...ENRICHED_CUSTOMERS[index], ...data };
    saveCustomers(ENRICHED_CUSTOMERS);
    return {
      success: true,
      statusCode: 200,
      message: "Cập nhật thành công",
      data: ENRICHED_CUSTOMERS[index],
    };
  },

  async deleteCustomer(
    id: string,
    options?: MockServiceOptions
  ): Promise<ApiResponse<boolean>> {
    await simulateLatency(options);
    const index = ENRICHED_CUSTOMERS.findIndex((c) => c.id === id);
    if (index !== -1) {
      ENRICHED_CUSTOMERS.splice(index, 1);
      saveCustomers(ENRICHED_CUSTOMERS);
    }
    return { success: true, statusCode: 200, message: "Xóa thành công", data: true };
  },
};
