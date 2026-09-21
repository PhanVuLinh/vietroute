import type { Customer } from "@/core/types/logistics";

/**
 * Khách hàng mở rộng với stats & addresses
 */
export type CustomerType = "INDIVIDUAL" | "ENTERPRISE";
export type CustomerTier = "REGULAR" | "SILVER" | "GOLD" | "VIP";

export interface CustomerAddress {
  id: string;
  label: string; // "Trụ sở chính", "Chi nhánh HCM", "Kho Cát Lái"
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  contactName?: string;
  contactPhone?: string;
}

export interface CustomerContractPricing {
  id: string;
  routeName: string;
  pricePerKm: number;    // VNĐ/km
  pricePerKg: number;    // VNĐ/kg
  minimumCharge: number; // VNĐ
  validFrom: string;
  validTo: string;
}

export interface CustomerStats {
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  totalRevenue: number;      // VNĐ
  averageOrderValue: number; // VNĐ
  completionRate: number;    // %
  lastOrderDate?: string;
}

export interface EnrichedCustomer extends Customer {
  tier: CustomerTier;
  taxCode?: string;
  contactPerson?: string;
  website?: string;
  notes?: string;
  addresses: CustomerAddress[];
  contractPricing: CustomerContractPricing[];
  stats: CustomerStats;
  createdAt: string;
}

export interface CustomerFilterParams {
  searchQuery: string;
  type: "ALL" | CustomerType;
  tier: "ALL" | CustomerTier;
  sortBy: "name" | "totalOrders" | "totalRevenue" | "createdAt";
  sortOrder: "asc" | "desc";
}
