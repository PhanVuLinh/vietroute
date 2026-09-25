export interface B2BShipperProfile {
  id: string;
  name: string;
  shortName: string;
  logoText: string;
  brandColor: string;
  taxCode: string;
  tier: 'VIP' | 'GOLD' | 'SILVER' | 'REGULAR';
  email: string;
  phone: string;
  address: string;
  contactPerson: string;
}

export interface B2BFinancialSummary {
  creditLimit: number;
  currentDebt: number;
  availableCredit: number;
  creditUsagePercent: number;
  paymentTermsDays: number;
  dueInDays: number;
  dueDate: string;
  bankAccount: {
    bank: string;
    accountNumber: string;
    accountName: string;
    vietQrPayload: string;
  };
}

export interface B2BKpiSummary {
  totalOrders: number;
  inTransitOrders: number;
  deliveredOrders: number;
  pendingOrders: number;
  onTimeRate: number; // 99.4%
  totalTonnage: number; // tấn hàng đã vận chuyển
  slaCompliance: string;
}

export interface B2BCargoItem {
  id: string;
  orderCode: string;
  cargoName: string;
  receiverName: string;
  receiverAddress: string;
  destinationCoords: [number, number]; // [lng, lat]
  originName: string;
  currentCoords: [number, number]; // [lng, lat]
  driverName: string;
  driverPhone: string;
  vehiclePlate: string;
  weightKg: number;
  status: 'IN_TRANSIT' | 'ASSIGNED' | 'PICKING_UP' | 'DELIVERED';
  etaMinutes: number;
  etaTime: string;
  temperature?: string;
  progressPercent: number;
}

export interface B2BBulkOrderItem {
  id: string;
  customerReference: string;
  receiverName: string;
  receiverPhone: string;
  receiverAddress: string;
  weight: number;
  volume?: number;
  codAmount?: number;
  notes?: string;
  isValid?: boolean;
  errors?: string[];
}

export interface B2BInvoiceSummary {
  id: string;
  invoiceCode: string;
  periodName: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIALLY_PAID';
  dueDate: string;
  createdAt: string;
}

export interface B2BPortalDashboardData {
  customer: B2BShipperProfile;
  kpi: B2BKpiSummary;
  finance: B2BFinancialSummary;
  invoices: B2BInvoiceSummary[];
  recentOrders: Array<{
    id: string;
    orderCode: string;
    receiverName: string;
    receiverAddress: string;
    weightKg: number;
    codAmount: number;
    status: string;
    createdAt: string;
  }>;
}
