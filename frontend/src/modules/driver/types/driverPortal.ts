export type DriverStopStatus = "PENDING" | "ARRIVED" | "DELIVERING" | "DELIVERED" | "FAILED";

export interface PodData {
  signatureUrl: string; // Base64 data URL từ HTML5 Canvas
  photoUrl?: string; // Data URL hoặc link ảnh
  codCollected: boolean;
  codAmount: number;
  codPaymentMethod: "CASH" | "BANK_TRANSFER";
  receiverName: string;
  receiverPhone?: string;
  receiverRelation: "SELF" | "FAMILY" | "SECURITY" | "COLLEAGUE" | "OTHER";
  notes?: string;
  completedAt: string;
  gpsCoords?: {
    lat: number;
    lng: number;
  };
}

export interface DriverStop {
  id: string;
  sequence: number;
  orderId: string;
  orderCode: string;
  customerName: string;
  customerPhone: string;
  address: string;
  lat: number;
  lng: number;
  weightKg: number;
  packagesCount: number;
  codAmount: number;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  status: DriverStopStatus;
  estimatedArrival: string;
  timeWindow: string;
  itemsSummary: string;
  failedReason?: string;
  pod?: PodData;
}

export interface DriverShift {
  driverId: string;
  driverName: string;
  driverCode: string;
  phone: string;
  vehiclePlate: string;
  vehicleName: string;
  routeCode: string;
  routeName: string;
  totalStops: number;
  completedStops: number;
  pendingStops: number;
  totalDistanceKm: number;
  totalCodExpected: number;
  totalCodCollected: number;
  stops: DriverStop[];
}
