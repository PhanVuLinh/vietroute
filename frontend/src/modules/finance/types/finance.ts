export type CodReconciliationStatus =
  | "PENDING"      // Chờ đối soát
  | "PARTIAL"      // Đã nộp một phần
  | "SETTLED"      // Đã hoàn tất đối soát
  | "DISCREPANCY"; // Có chênh lệch cần giải trình

export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "E_WALLET";

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED";

export interface CodEntryItem {
  id: string;
  orderId: string;
  orderCode: string;
  receiverName: string;
  receiverPhone: string;
  expectedCod: number;
  actualCollected: number;
  paymentMethod: PaymentMethod;
  isDiscrepant: boolean;
  discrepancyReason?: string;
}

export interface CodReconciliationItem {
  id: string;
  reconciliationCode: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  date: string;
  totalOrders: number;
  totalCodAmount: number;
  collectedAmount: number;
  submittedAmount: number;
  discrepancy: number;
  status: CodReconciliationStatus;
  notes?: string;
  cashierName?: string;
  confirmedAt?: string | null;
  entriesCount: number;
  entries?: CodEntryItem[];
}

export interface CodSummary {
  totalCodExpected: number;
  totalCollected: number;
  totalSubmitted: number;
  totalDiscrepancy: number;
  pendingCount: number;
  discrepancyCount: number;
  settledCount: number;
  totalSessions: number;
}

export interface InvoiceLineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface InvoiceItem {
  id: string;
  invoiceCode: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerTaxCode?: string;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  vatAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  status: InvoiceStatus;
  paymentTerms?: string;
  notes?: string;
  itemsCount: number;
  items?: InvoiceLineItem[];
}

export interface BillingSummary {
  totalRevenue: number;
  totalCollected: number;
  totalPending: number;
  overdueCount: number;
  totalInvoices: number;
}

export interface AgingReport {
  current: number;
  days1To30: number;
  days31To60: number;
  daysOver60: number;
  totalUnpaid: number;
  overdueInvoicesCount: number;
}
