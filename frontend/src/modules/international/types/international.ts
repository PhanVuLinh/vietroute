export type DirectionType = 'EXPORT' | 'IMPORT' | 'CROSS_BORDER';

export type TransportModeType = 'OCEAN_FCL' | 'OCEAN_LCL' | 'AIR_FREIGHT' | 'ROAD_CROSS_BORDER';

export type IncotermType = 'FOB' | 'CIF' | 'EXW' | 'DDP' | 'DAP' | 'CFR' | 'FCA';

export type ShipmentStatusType =
  | 'BOOKING_CONFIRMED'
  | 'CUSTOMS_PROCESSING'
  | 'CUSTOMS_CLEARED'
  | 'SAILING'
  | 'ARRIVED_PORT'
  | 'DELIVERED'
  | 'CANCELLED';

export type CustomsChannelType = 'GREEN' | 'YELLOW' | 'RED';

export type CustomsStatusType = 'DRAFT' | 'REGISTERED' | 'CLEARED' | 'REJECTED';

export interface InternationalShipment {
  id: string;
  shipmentCode: string;
  direction: DirectionType;
  transportMode: TransportModeType;
  incoterm: IncotermType;
  carrierName: string;
  vesselFlightNo: string;
  polPort: string;
  podPort: string;
  etdDate: string;
  etaDate: string;
  blAwbNumber: string;
  containerNumber?: string;
  sealNumber?: string;
  containerType?: string;
  grossWeightKg: number;
  cbmVolume: number;
  packageCount: number;
  shipperName: string;
  consigneeName: string;
  currency: string;
  freightAmount: number;
  customsStatus: 'NOT_FILED' | 'GREEN' | 'YELLOW' | 'RED' | 'CLEARED';
  status: ShipmentStatusType;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomsDeclaration {
  id: string;
  declarationNo: string;
  shipmentId: string;
  shipmentCode: string;
  customsBranch: string;
  declarationType: string;
  channel: CustomsChannelType;
  hsCode: string;
  commodityDescription: string;
  invoiceValue: number;
  currency: string;
  importTaxAmount: number;
  vatTaxAmount: number;
  status: CustomsStatusType;
  registeredDate: string;
  clearedDate?: string;
}

export interface ContainerTrackingItem {
  id: string;
  containerNo: string;
  type: '20GP' | '40GP' | '40HC' | '20RF' | '40RF';
  carrier: string;
  shipmentCode: string;
  sealNo: string;
  currentLocation: string;
  temperatureRequired?: string;
  demDetFreeDays: number;
  gateInDate: string;
  freeTimeExpiryDate: string;
  overdueDays: number;
  estimatedPenaltyAmountVnd: number;
  status: 'IN_DEPOT' | 'ON_VESSEL' | 'AT_FACTORY' | 'RETURNED_EMPTY';
}

export interface InternationalPort {
  code: string;
  name: string;
  country: string;
  city: string;
  type: 'SEAPORT' | 'AIRPORT' | 'BORDER_GATE';
}

export interface ExchangeRateItem {
  currency: string;
  name: string;
  buyRateVnd: number;
  transferRateVnd: number;
  sellRateVnd: number;
  updatedAt: string;
}

export interface LocalChargeItem {
  code: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  appliedUnit: string;
}

export interface InternationalFilterParams {
  direction?: string;
  mode?: string;
  incoterm?: string;
  status?: string;
  search?: string;
}

export interface CreateShipmentInput {
  shipmentCode: string;
  direction: DirectionType;
  transportMode: TransportModeType;
  incoterm: IncotermType;
  carrierName: string;
  vesselFlightNo?: string;
  polPort: string;
  podPort: string;
  etdDate?: string;
  etaDate?: string;
  blAwbNumber?: string;
  containerNumber?: string;
  sealNumber?: string;
  containerType?: string;
  grossWeightKg?: number;
  cbmVolume?: number;
  packageCount?: number;
  shipperName?: string;
  consigneeName?: string;
  currency?: string;
  freightAmount?: number;
  status?: string;
  notes?: string;
}

export interface CreateCustomsInput {
  declarationNo: string;
  shipmentId: string;
  customsBranch: string;
  declarationType: string;
  channel: CustomsChannelType;
  hsCode?: string;
  commodityDescription?: string;
  invoiceValue?: number;
  currency?: string;
  importTaxAmount?: number;
  vatTaxAmount?: number;
  status?: CustomsStatusType;
}

export interface HsCodeItem {
  hsCode: string;
  descriptionVi: string;
  descriptionEn: string;
  unit: string;
  standardDutyRate: number; // Thuế thông thường %
  mfnRate: number;          // Thuế MFN %
  evftaRate: number;        // Thuế EVFTA %
  cptppRate: number;        // Thuế CPTPP %
  acftaRate: number;        // Thuế ACFTA Form E %
  atigaRate: number;        // Thuế ATIGA Form D %
  vkftaRate: number;        // Thuế VKFTA Form AK %
  vatRate: number;          // Thuế GTGT %
  specializedInspection: string; // Kiểm tra chuyên ngành
  inspectionAgency?: string;
  importConditions?: string;
}

export interface FtaTaxCalculationResult {
  hsCode: string;
  descriptionVi: string;
  ftaName: string;
  applicableDutyRate: number;
  mfnRate: number;
  standardDutyRate: number;
  vatRate: number;
  cifValueVnd: number;
  applicableDutyVnd: number;
  vatVnd: number;
  totalTaxVnd: number;
  dutySavingsVnd: number;
  specializedInspection: string;
  inspectionAgency?: string;
  importConditions?: string;
}

export interface ShipmentFinancialPnl {
  shipmentId: string;
  shipmentCode: string;
  shipperName: string;
  carrierName: string;
  currency: string;
  sellingFreight: number;
  sellingLocalCharges: number;
  totalRevenueVnd: number;
  buyingFreight: number;
  buyingLocalCharges: number;
  truckingCostVnd: number;
  customsCostVnd: number;
  portHandlingCostVnd: number;
  totalCostVnd: number;
  grossProfitVnd: number;
  grossProfitUsd: number;
  profitMarginPercent: number; // ROS %
  fxGainLossVnd: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface ContainerDepositItem {
  id: string;
  containerNo: string;
  shipmentCode: string;
  carrier: string;
  depositAmountVnd: number;
  receiptNumber: string; // Số phiếu cược EIR
  depositedDate: string;
  refundDueDate: string;
  refundStatus: 'PENDING_REFUND' | 'REFUNDED_FULL' | 'DEDUCTED_REPAIR';
  refundedAmountVnd?: number;
  deductedReason?: string;
  eirCondition: 'INTACT' | 'CLEANED' | 'DENTED' | 'HOLE_REPAIRED';
}

export interface VesselAisTrackingItem {
  vesselName: string;
  mmsi: string;
  imo: string;
  flag: string;
  shipmentCodes: string[];
  currentLatitude: number;
  currentLongitude: number;
  speedKnots: number;
  headingDegrees: number;
  departurePort: string;
  destinationPort: string;
  atdDate: string;
  etaPredicted: string;
  distanceCoveredNm: number;
  distanceRemainingNm: number;
  progressPercent: number;
  weatherRisk: 'LOW_NORMAL' | 'MODERATE_SWELL' | 'HIGH_TYPHOON_WARNING';
  navStatus: 'UNDERWAY_USING_ENGINE' | 'MOORED' | 'AT_ANCHOR';
}

export interface ShippingDocument {
  id: string;
  shipmentId: string;
  shipmentCode: string;
  documentType: 'BILL_OF_LADING' | 'COMMERCIAL_INVOICE' | 'PACKING_LIST' | 'CERTIFICATE_OF_ORIGIN' | 'PHYTOSANITARY' | 'VNACCS_DECLARATION';
  documentNumber: string;
  issueDate: string;
  issuer: string;
  fileFormat: string;
  status: 'DRAFT' | 'ISSUED' | 'VERIFIED' | 'REJECTED';
  verificationNotes?: string;
  isMandatory: boolean;
}

