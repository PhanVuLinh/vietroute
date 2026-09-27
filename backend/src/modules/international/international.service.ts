import { Injectable, NotFoundException, BadRequestException, OnModuleInit } from '@nestjs/common';
import { CreateInternationalShipmentDto } from './dto/create-shipment.dto.js';
import { CreateCustomsDeclarationDto } from './dto/create-customs.dto.js';

export interface InternationalShipment {
  id: string;
  shipmentCode: string;
  direction: 'EXPORT' | 'IMPORT' | 'CROSS_BORDER';
  transportMode: 'OCEAN_FCL' | 'OCEAN_LCL' | 'AIR_FREIGHT' | 'ROAD_CROSS_BORDER';
  incoterm: 'FOB' | 'CIF' | 'EXW' | 'DDP' | 'DAP' | 'CFR' | 'FCA';
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
  status: 'BOOKING_CONFIRMED' | 'CUSTOMS_PROCESSING' | 'CUSTOMS_CLEARED' | 'SAILING' | 'ARRIVED_PORT' | 'DELIVERED' | 'CANCELLED';
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
  channel: 'GREEN' | 'YELLOW' | 'RED';
  hsCode: string;
  commodityDescription: string;
  invoiceValue: number;
  currency: string;
  importTaxAmount: number;
  vatTaxAmount: number;
  status: 'DRAFT' | 'REGISTERED' | 'CLEARED' | 'REJECTED';
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
  appliedUnit: string; // Per Container, Per Bill, Per CBM
}

export interface HsCodeItem {
  hsCode: string;
  descriptionVi: string;
  descriptionEn: string;
  unit: string;
  standardDutyRate: number; // Thuế thông thường %
  mfnRate: number;          // Thuế MFN %
  evftaRate: number;        // Thuế EVFTA (Việt Nam - EU) %
  cptppRate: number;        // Thuế CPTPP %
  acftaRate: number;        // Thuế ACFTA Form E (Trung Quốc) %
  atigaRate: number;        // Thuế ATIGA Form D (ASEAN) %
  vkftaRate: number;        // Thuế VKFTA Form AK (Hàn Quốc) %
  vatRate: number;          // Thuế GTGT %
  specializedInspection: string; // Kiểm tra chuyên ngành
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
  receiptNumber: string; // Số phiếu thu cược EIR
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

export interface ContainerDrayageDispatchItem {
  id: string;
  dispatchCode: string;
  shipmentCode: string;
  containerNo: string;
  containerType: string;
  dispatchType: 'PORT_TO_DOOR' | 'DOOR_TO_PORT' | 'EMPTY_RETURN_DEPOT' | 'EMPTY_PICKUP_DEPOT';
  pickupLocation: string;
  deliveryLocation: string;
  tractorPlate: string;
  trailerPlate: string;
  driverName: string;
  driverPhone: string;
  driverLicenseGrade: 'FC';
  appointmentTime: string;
  status: 'PENDING_DISPATCH' | 'DISPATCHED' | 'PULLED_FROM_PORT' | 'DELIVERED_FACTORY' | 'COMPLETED';
  tollFeeVnd: number;
  fuelEstimatedLiters: number;
  notes?: string;
  createdAt: string;
}

export interface AiImportAnalysisReport {
  shipmentCode: string;
  analyzedAt: string;
  overallRiskScore: number; // 0 - 100
  riskLevel: 'LOW_SAFE' | 'MEDIUM_CAUTION' | 'HIGH_CRITICAL';
  portCongestionPrediction: {
    portCode: string;
    portName: string;
    congestionLevelPercent: number;
    averageVesselWaitingTimeHours: number;
    recommendedDrayageWindow: string;
  };
  customsRiskAssessment: {
    channelPrediction: 'GREEN' | 'YELLOW' | 'RED';
    auditProbabilityPercent: number;
    complianceFlags: string[];
    potentialPenaltyWarning?: string;
  };
  demurrageAvoidancePlan: {
    freeTimeRemainingDays: number;
    dailyPenaltyVnd: number;
    maxSafeStorageDate: string;
    recommendedAction: string;
  };
  landedCostBreakdown: {
    fobValueVnd: number;
    freightAndInsuranceVnd: number;
    importTaxAndVatVnd: number;
    portAndLocalChargesVnd: number;
    inlandDrayageTruckingVnd: number;
    totalLandedCostVnd: number;
    costPerUnitVnd: number;
    unitName: string;
  };
  aiRecommendations: string[];
}

@Injectable()
export class InternationalService implements OnModuleInit {
  private shipments: InternationalShipment[] = [];
  private customsDeclarations: CustomsDeclaration[] = [];
  private containers: ContainerTrackingItem[] = [];
  private ports: InternationalPort[] = [];
  private exchangeRates: ExchangeRateItem[] = [];
  private localCharges: LocalChargeItem[] = [];
  private hsCodes: HsCodeItem[] = [];
  private shipmentFinancials: ShipmentFinancialPnl[] = [];
  private containerDeposits: ContainerDepositItem[] = [];
  private vessels: VesselAisTrackingItem[] = [];
  private shippingDocuments: ShippingDocument[] = [];
  private drayageDispatches: ContainerDrayageDispatchItem[] = [];

  onModuleInit() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // 1. Cảng biển & Sân bay chuẩn quốc tế UN/LOCODE
    this.ports = [
      { code: 'VNSGN', name: 'Cảng Tân Cảng Cát Lái', country: 'Việt Nam', city: 'TP. Hồ Chí Minh', type: 'SEAPORT' },
      { code: 'VNHPH', name: 'Cảng Hải Phòng (Lạch Huyện / Đình Vũ)', country: 'Việt Nam', city: 'Hải Phòng', type: 'SEAPORT' },
      { code: 'VNDAD', name: 'Cảng Tiên Sa Đà Nẵng', country: 'Việt Nam', city: 'Đà Nẵng', type: 'SEAPORT' },
      { code: 'SGN', name: 'Sân bay Quốc tế Tân Sơn Nhất Cargo', country: 'Việt Nam', city: 'TP. Hồ Chí Minh', type: 'AIRPORT' },
      { code: 'HAN', name: 'Sân bay Quốc tế Nội Bài Cargo', country: 'Việt Nam', city: 'Hà Nội', type: 'AIRPORT' },
      { code: 'VNHNI', name: 'Cửa khẩu Quốc tế Hữu Nghị', country: 'Việt Nam', city: 'Lạng Sơn', type: 'BORDER_GATE' },
      { code: 'USLAX', name: 'Port of Los Angeles', country: 'Hoa Kỳ (USA)', city: 'Los Angeles', type: 'SEAPORT' },
      { code: 'USNYC', name: 'Port of New York & New Jersey', country: 'Hoa Kỳ (USA)', city: 'New York', type: 'SEAPORT' },
      { code: 'CNSHA', name: 'Port of Shanghai (Cảng Thượng Hải)', country: 'Trung Quốc', city: 'Thượng Hải', type: 'SEAPORT' },
      { code: 'CNNBO', name: 'Port of Ningbo-Zhoushan (Ninh Ba)', country: 'Trung Quốc', city: 'Chiết Giang', type: 'SEAPORT' },
      { code: 'SGSIN', name: 'Port of Singapore', country: 'Singapore', city: 'Singapore', type: 'SEAPORT' },
      { code: 'DEHAM', name: 'Port of Hamburg', country: 'Đức (Germany)', city: 'Hamburg', type: 'SEAPORT' },
      { code: 'FRA', name: 'Frankfurt Airport Cargo Terminal', country: 'Đức (Germany)', city: 'Frankfurt', type: 'AIRPORT' },
      { code: 'NRT', name: 'Tokyo Narita Airport', country: 'Nhật Bản', city: 'Tokyo', type: 'AIRPORT' },
    ];

    // 2. Bảng tỷ giá ngoại tệ Vietcombank
    this.exchangeRates = [
      { currency: 'USD', name: 'Đô la Mỹ', buyRateVnd: 25420, transferRateVnd: 25450, sellRateVnd: 25780, updatedAt: new Date().toISOString() },
      { currency: 'EUR', name: 'Đồng Euro', buyRateVnd: 27580, transferRateVnd: 27650, sellRateVnd: 28100, updatedAt: new Date().toISOString() },
      { currency: 'CNY', name: 'Nhân dân tệ Trung Quốc', buyRateVnd: 3510, transferRateVnd: 3530, sellRateVnd: 3620, updatedAt: new Date().toISOString() },
      { currency: 'JPY', name: 'Yên Nhật', buyRateVnd: 165.2, transferRateVnd: 166.5, sellRateVnd: 171.8, updatedAt: new Date().toISOString() },
      { currency: 'SGD', name: 'Đô la Singapore', buyRateVnd: 19150, transferRateVnd: 19220, sellRateVnd: 19600, updatedAt: new Date().toISOString() },
    ];

    // 3. Phụ phí cảng biển (Local Charges)
    this.localCharges = [
      { code: 'THC', name: 'Terminal Handling Charge', description: 'Phí bốc xếp container từ cầu tàu lên bãi cảng', amount: 155, currency: 'USD', appliedUnit: 'Per 40HC' },
      { code: 'D/O', name: 'Delivery Order Fee', description: 'Phí phát hành lệnh giao hàng cho chủ hàng nhập khẩu', amount: 45, currency: 'USD', appliedUnit: 'Per Bill' },
      { code: 'CFS', name: 'Container Freight Station', description: 'Phí bốc dỡ và lưu kho cho hàng lẻ đóng ghép LCL', amount: 18, currency: 'USD', appliedUnit: 'Per CBM' },
      { code: 'CIC', name: 'Container Imbalance Charge', description: 'Phí phụ trội bù đắp chi phí điều chuyển vỏ rỗng', amount: 80, currency: 'USD', appliedUnit: 'Per Container' },
      { code: 'SEAL', name: 'Seal Fee', description: 'Phí kẹp chì niêm phong bảo mật hải quan', amount: 10, currency: 'USD', appliedUnit: 'Per Seal' },
      { code: 'AMS', name: 'Automated Manifest System', description: 'Phí truyền dữ liệu tờ khai an ninh điện tử vào hải quan Hoa Kỳ', amount: 35, currency: 'USD', appliedUnit: 'Per Bill' },
    ];

    // 4. Lô hàng Xuất Nhập Khẩu mẫu
    this.shipments = [
      {
        id: 'shp-exp-001',
        shipmentCode: 'EXP-2026-001',
        direction: 'EXPORT',
        transportMode: 'OCEAN_FCL',
        incoterm: 'FOB',
        carrierName: 'Maersk Line',
        vesselFlightNo: 'MAERSK MC-KINNEY 2601E',
        polPort: 'VNSGN - Cảng Tân Cảng Cát Lái',
        podPort: 'USLAX - Port of Los Angeles',
        etdDate: '2026-09-28T14:00:00.000Z',
        etaDate: '2026-10-18T08:00:00.000Z',
        blAwbNumber: 'MAEU982180421',
        containerNumber: 'MSKU8841920',
        sealNumber: 'ML-VN98412',
        containerType: '40HC',
        grossWeightKg: 24500,
        cbmVolume: 68.5,
        packageCount: 950,
        shipperName: 'Tập Đoàn May Mặc Xuất Khẩu Việt Tiến',
        consigneeName: 'Walmart Global Sourcing (USA)',
        currency: 'USD',
        freightAmount: 3850,
        customsStatus: 'CLEARED',
        status: 'CUSTOMS_CLEARED',
        notes: 'Hàng may mặc đi Mỹ, đã kiểm tra hun trùng và kẹp chì điện tử.',
        createdAt: '2026-09-20T10:00:00.000Z',
        updatedAt: '2026-09-27T09:30:00.000Z',
      },
      {
        id: 'shp-imp-002',
        shipmentCode: 'IMP-2026-002',
        direction: 'IMPORT',
        transportMode: 'OCEAN_FCL',
        incoterm: 'CIF',
        carrierName: 'COSCO Shipping Lines',
        vesselFlightNo: 'COSCO HELLAS 045W',
        polPort: 'CNSHA - Port of Shanghai',
        podPort: 'VNHPH - Cảng Hải Phòng',
        etdDate: '2026-09-22T08:00:00.000Z',
        etaDate: '2026-09-29T16:00:00.000Z',
        blAwbNumber: 'COSU632194012',
        containerNumber: 'TCLU1284711',
        sealNumber: 'CS-SH28192',
        containerType: '20GP',
        grossWeightKg: 16800,
        cbmVolume: 28.2,
        packageCount: 420,
        shipperName: 'Semiconductor Precision Ltd (Shanghai)',
        consigneeName: 'Công ty Cổ phần Công nghệ FPT / Viettel',
        currency: 'USD',
        freightAmount: 850,
        customsStatus: 'YELLOW',
        status: 'CUSTOMS_PROCESSING',
        notes: 'Linh kiện chip điện tử bán dẫn, hải quan yêu cầu bổ sung C/O Form E.',
        createdAt: '2026-09-21T08:00:00.000Z',
        updatedAt: '2026-09-27T10:15:00.000Z',
      },
      {
        id: 'shp-air-003',
        shipmentCode: 'AIR-2026-003',
        direction: 'EXPORT',
        transportMode: 'AIR_FREIGHT',
        incoterm: 'DDP',
        carrierName: 'Qatar Airways Cargo',
        vesselFlightNo: 'QR 8842 Boeing 777F',
        polPort: 'HAN - Sân bay Quốc tế Nội Bài Cargo',
        podPort: 'FRA - Frankfurt Airport Cargo Terminal',
        etdDate: '2026-09-28T22:30:00.000Z',
        etaDate: '2026-09-29T14:45:00.000Z',
        blAwbNumber: '157-89410294',
        containerType: 'ULD Air Pallet',
        grossWeightKg: 620,
        cbmVolume: 3.8,
        packageCount: 35,
        shipperName: 'Samsung Electronics Vietnam (SEV)',
        consigneeName: 'Samsung Electronics Europe Logistics B.V.',
        currency: 'EUR',
        freightAmount: 2650,
        customsStatus: 'GREEN',
        status: 'BOOKING_CONFIRMED',
        notes: 'Lô hàng mẫu bo mạch điện thoại flagship phục vụ ra mắt thị trường EU.',
        createdAt: '2026-09-26T14:00:00.000Z',
        updatedAt: '2026-09-27T08:45:00.000Z',
      },
      {
        id: 'shp-crb-004',
        shipmentCode: 'CRB-2026-004',
        direction: 'CROSS_BORDER',
        transportMode: 'ROAD_CROSS_BORDER',
        incoterm: 'DAP',
        carrierName: 'VietRoute Cross-Border Logistics Fleet',
        vesselFlightNo: 'Xe liên vận VN-CN: 29H-882.19 / Rơ-mooc 29R-012.88',
        polPort: 'VNHNI - Cửa khẩu Quốc tế Hữu Nghị',
        podPort: 'Trung Quốc - Chợ Nông Sản Nam Ninh',
        etdDate: '2026-09-27T18:00:00.000Z',
        etaDate: '2026-09-28T12:00:00.000Z',
        blAwbNumber: 'VTR-CRB-2026-004',
        containerNumber: 'CMAU9921448',
        sealNumber: 'HQ-HN-44129',
        containerType: '40RF',
        grossWeightKg: 22000,
        cbmVolume: 65.0,
        packageCount: 1800,
        shipperName: 'Hợp Tác Xã Nông Sản Sầu Riêng Tiền Giang',
        consigneeName: 'Guangxi Fresh Fruits Trading Co., Ltd',
        currency: 'CNY',
        freightAmount: 18500,
        customsStatus: 'CLEARED',
        status: 'SAILING',
        notes: 'Container lạnh duy trì nhiệt độ +14°C, có chứng thư kiểm dịch thực vật.',
        createdAt: '2026-09-25T11:00:00.000Z',
        updatedAt: '2026-09-27T14:20:00.000Z',
      },
      {
        id: 'shp-imp-005',
        shipmentCode: 'IMP-2026-005',
        direction: 'IMPORT',
        transportMode: 'OCEAN_FCL',
        incoterm: 'EXW',
        carrierName: 'Hapag-Lloyd',
        vesselFlightNo: 'AL MURABBA 022E',
        polPort: 'DEHAM - Port of Hamburg',
        podPort: 'VNSGN - Cảng Tân Cảng Cát Lái',
        etdDate: '2026-09-02T10:00:00.000Z',
        etaDate: '2026-09-27T20:00:00.000Z',
        blAwbNumber: 'HLCUHAM2608192',
        containerNumber: 'HLXU4819201',
        sealNumber: 'HL-DE99120',
        containerType: '40HC',
        grossWeightKg: 21800,
        cbmVolume: 58.0,
        packageCount: 12,
        shipperName: 'Siemens Industrial Automation GmbH',
        consigneeName: 'VinFast Auto Manufacturing Complex',
        currency: 'EUR',
        freightAmount: 3400,
        customsStatus: 'RED',
        status: 'ARRIVED_PORT',
        notes: 'Dây chuyền dập robot công nghiệp, phân luồng Đỏ kiểm hóa thực tế tại Cát Lái.',
        createdAt: '2026-09-01T09:00:00.000Z',
        updatedAt: '2026-09-27T16:00:00.000Z',
      },
    ];

    // 5. Tờ khai Hải quan điện tử VNACCS
    this.customsDeclarations = [
      {
        id: 'cst-001',
        declarationNo: '104829104820',
        shipmentId: 'shp-exp-001',
        shipmentCode: 'EXP-2026-001',
        customsBranch: 'Chi cục HQ CK Cảng Sài Gòn KV1 (Cát Lái)',
        declarationType: 'B11 (Xuất kinh doanh)',
        channel: 'GREEN',
        hsCode: '6109.10.00',
        commodityDescription: 'Áo thun cotton dệt kim nam xuất khẩu',
        invoiceValue: 145000,
        currency: 'USD',
        importTaxAmount: 0,
        vatTaxAmount: 0,
        status: 'CLEARED',
        registeredDate: '2026-09-26T08:30:00.000Z',
        clearedDate: '2026-09-26T08:45:00.000Z',
      },
      {
        id: 'cst-002',
        declarationNo: '104829881923',
        shipmentId: 'shp-imp-002',
        shipmentCode: 'IMP-2026-002',
        customsBranch: 'Chi cục Hải quan CK Cảng Đình Vũ - Hải Phòng',
        declarationType: 'A11 (Nhập kinh doanh tiêu dùng)',
        channel: 'YELLOW',
        hsCode: '8542.31.00',
        commodityDescription: 'Bộ vi xử lý tích hợp (IC Chipset điều khiển)',
        invoiceValue: 88500,
        currency: 'USD',
        importTaxAmount: 0, // Thuế ưu đãi ACFTA theo C/O Form E
        vatTaxAmount: 225675000, // VAT 10%
        status: 'REGISTERED',
        registeredDate: '2026-09-27T09:15:00.000Z',
      },
      {
        id: 'cst-003',
        declarationNo: '104830119284',
        shipmentId: 'shp-air-003',
        shipmentCode: 'AIR-2026-003',
        customsBranch: 'Chi cục HQ CK Sân bay Quốc tế Nội Bài',
        declarationType: 'E31 (Nhập / Xuất sản xuất gia công)',
        channel: 'GREEN',
        hsCode: '8517.70.10',
        commodityDescription: 'Bo mạch PBA hoàn chỉnh cho smartphone',
        invoiceValue: 320000,
        currency: 'EUR',
        importTaxAmount: 0,
        vatTaxAmount: 0,
        status: 'CLEARED',
        registeredDate: '2026-09-27T08:00:00.000Z',
        clearedDate: '2026-09-27T08:10:00.000Z',
      },
      {
        id: 'cst-004',
        declarationNo: '104830554190',
        shipmentId: 'shp-imp-005',
        shipmentCode: 'IMP-2026-005',
        customsBranch: 'Chi cục HQ CK Cảng Sài Gòn KV1 (Cát Lái)',
        declarationType: 'A12 (Nhập kinh doanh sản xuất máy móc thiết bị)',
        channel: 'RED',
        hsCode: '8479.89.40',
        commodityDescription: 'Cánh tay robot công nghiệp dập tự động 6 bậc tự do',
        invoiceValue: 420000,
        currency: 'EUR',
        importTaxAmount: 0,
        vatTaxAmount: 1159200000,
        status: 'REGISTERED',
        registeredDate: '2026-09-27T10:00:00.000Z',
      },
    ];

    // 6. Theo dõi Container & Hạn Demurrage / Detention (Phí phạt lưu bãi)
    this.containers = [
      {
        id: 'cnt-01',
        containerNo: 'MSKU8841920',
        type: '40HC',
        carrier: 'Maersk Line',
        shipmentCode: 'EXP-2026-001',
        sealNo: 'ML-VN98412',
        currentLocation: 'Bãi Cảng Cát Lái - Block E3',
        demDetFreeDays: 7,
        gateInDate: '2026-09-26T15:00:00.000Z',
        freeTimeExpiryDate: '2026-10-03T23:59:59.000Z',
        overdueDays: 0,
        estimatedPenaltyAmountVnd: 0,
        status: 'IN_DEPOT',
      },
      {
        id: 'cnt-02',
        containerNo: 'TCLU1284711',
        type: '20GP',
        carrier: 'COSCO Shipping',
        shipmentCode: 'IMP-2026-002',
        sealNo: 'CS-SH28192',
        currentLocation: 'Tàu COSCO HELLAS (Biển Đông)',
        demDetFreeDays: 14,
        gateInDate: '2026-09-22T08:00:00.000Z',
        freeTimeExpiryDate: '2026-10-06T23:59:59.000Z',
        overdueDays: 0,
        estimatedPenaltyAmountVnd: 0,
        status: 'ON_VESSEL',
      },
      {
        id: 'cnt-03',
        containerNo: 'HLXU4819201',
        type: '40HC',
        carrier: 'Hapag-Lloyd',
        shipmentCode: 'IMP-2026-005',
        sealNo: 'HL-DE99120',
        currentLocation: 'Bãi Kiểm Hóa Hải Quan Cát Lái (Khu C)',
        demDetFreeDays: 5,
        gateInDate: '2026-09-21T09:00:00.000Z',
        freeTimeExpiryDate: '2026-09-26T23:59:59.000Z',
        overdueDays: 1, // Đã quá hạn 1 ngày!
        estimatedPenaltyAmountVnd: 1250000, // Phạt lưu bãi 1.250.000 VNĐ / ngày
        status: 'IN_DEPOT',
      },
      {
        id: 'cnt-04',
        containerNo: 'CMAU9921448',
        type: '40RF',
        carrier: 'VietRoute Fleet',
        shipmentCode: 'CRB-2026-004',
        sealNo: 'HQ-HN-44129',
        currentLocation: 'Đang di chuyển trên Quốc lộ 1A qua Bắc Giang',
        temperatureRequired: '+14°C',
        demDetFreeDays: 7,
        gateInDate: '2026-09-25T11:00:00.000Z',
        freeTimeExpiryDate: '2026-10-02T23:59:59.000Z',
        overdueDays: 0,
        estimatedPenaltyAmountVnd: 0,
        status: 'AT_FACTORY',
      },
    ];

    // 5. Biểu thuế XNK & Phân loại Mã HS Việt Nam chuẩn 2026
    this.hsCodes = [
      {
        hsCode: '0306.17.21',
        descriptionVi: 'Tôm thẻ chân trắng đông lạnh (Penaeus vannamei), bóc vỏ, bỏ đầu',
        descriptionEn: 'Frozen whiteleg shrimp, peeled, headless',
        unit: 'KG',
        standardDutyRate: 15,
        mfnRate: 10,
        evftaRate: 0,
        cptppRate: 0,
        acftaRate: 0,
        atigaRate: 0,
        vkftaRate: 0,
        vatRate: 0, // Hàng thủy sản nguyên liệu chưa chế biến sâu thuộc đối tượng không chịu VAT
        specializedInspection: 'Bắt buộc Kiểm dịch động vật thủy sản nhập khẩu',
        inspectionAgency: 'Cục Thú Y (Bộ NN&PTNT)',
        importConditions: 'Cần có Health Certificate từ cơ quan thẩm quyền nước xuất khẩu',
      },
      {
        hsCode: '0901.11.10',
        descriptionVi: 'Cà phê Robusta nhân sống, chưa rang, chưa khử chất caffeine',
        descriptionEn: 'Coffee, not roasted, not decaffeinated, Robusta',
        unit: 'KG',
        standardDutyRate: 30,
        mfnRate: 20,
        evftaRate: 0,
        cptppRate: 0,
        acftaRate: 5,
        atigaRate: 0,
        vkftaRate: 0,
        vatRate: 5,
        specializedInspection: 'Kiểm dịch thực vật tại cửa khẩu',
        inspectionAgency: 'Cục Bảo vệ Thực vật',
        importConditions: 'Chứng thư kiểm dịch Phytosanitary',
      },
      {
        hsCode: '6109.10.10',
        descriptionVi: 'Áo phông (T-shirts) dệt kim hoặc móc, bằng bông (cotton 100%)',
        descriptionEn: 'T-shirts, knitted or crocheted, of cotton',
        unit: 'PCE',
        standardDutyRate: 30,
        mfnRate: 20,
        evftaRate: 2,
        cptppRate: 0,
        acftaRate: 0,
        atigaRate: 0,
        vkftaRate: 5,
        vatRate: 8,
        specializedInspection: 'Kiểm tra dư lượng Formaldehyt và Amin thơm chuyển hóa',
        inspectionAgency: 'Viện Dệt May / Trung tâm Giám định',
        importConditions: 'Quy chuẩn kỹ thuật quốc gia QCVN 01:2017/BCT',
      },
      {
        hsCode: '8541.43.00',
        descriptionVi: 'Tấm pin năng lượng mặt trời (Solar photovoltaic modules)',
        descriptionEn: 'Photovoltaic cells assembled in modules or made up into panels',
        unit: 'PCE',
        standardDutyRate: 5,
        mfnRate: 0,
        evftaRate: 0,
        cptppRate: 0,
        acftaRate: 0,
        atigaRate: 0,
        vkftaRate: 0,
        vatRate: 8,
        specializedInspection: 'Kiểm tra hiệu suất năng lượng tối thiểu & an toàn điện',
        inspectionAgency: 'Bộ Công Thương',
        importConditions: 'Chứng nhận hợp quy dán nhãn năng lượng',
      },
      {
        hsCode: '4011.20.10',
        descriptionVi: 'Lốp xe tải loại bơm hơi bằng cao su, kết cấu bố tròn (Radial)',
        descriptionEn: 'New pneumatic tyres, of rubber, of a kind used on buses or lorries (Radial)',
        unit: 'PCE',
        standardDutyRate: 35,
        mfnRate: 25,
        evftaRate: 5,
        cptppRate: 0,
        acftaRate: 0,
        atigaRate: 0,
        vkftaRate: 5,
        vatRate: 8,
        specializedInspection: 'Kiểm tra chất lượng nhà nước an toàn kỹ thuật linh kiện ô tô',
        inspectionAgency: 'Cục Đăng Kiểm Việt Nam (Bộ GTVT)',
        importConditions: 'Giấy chứng nhận thử nghiệm mẫu theo QCVN 34:2017/BGTVT',
      },
      {
        hsCode: '0401.20.10',
        descriptionVi: 'Sữa tươi tiệt trùng UHT, hàm lượng chất béo từ 1% đến 6%',
        descriptionEn: 'Milk and cream, UHT, fat content exceeding 1% but not exceeding 6%',
        unit: 'LTR',
        standardDutyRate: 25,
        mfnRate: 15,
        evftaRate: 3.5,
        cptppRate: 0,
        acftaRate: 5,
        atigaRate: 0,
        vkftaRate: 0,
        vatRate: 8,
        specializedInspection: 'Kiểm tra an toàn thực phẩm nhập khẩu & Kiểm dịch động vật',
        inspectionAgency: 'Cục An toàn Thực phẩm (Bộ Y Tế) & Cục Thú Y',
        importConditions: 'Bản tự công bố sản phẩm và chứng thư vệ sinh thú y',
      },
      {
        hsCode: '8471.30.20',
        descriptionVi: 'Máy vi tính xách tay (Laptop), bao gồm cả notebook và subnotebook',
        descriptionEn: 'Laptops, portable automatic data processing machines',
        unit: 'PCE',
        standardDutyRate: 0,
        mfnRate: 0,
        evftaRate: 0,
        cptppRate: 0,
        acftaRate: 0,
        atigaRate: 0,
        vkftaRate: 0,
        vatRate: 8,
        specializedInspection: 'Kiểm tra chất lượng hợp quy thiết bị viễn thông và CNTT',
        inspectionAgency: 'Bộ Thông tin và Truyền thông (Cục Viễn Thông)',
        importConditions: 'Giấy chứng nhận hợp quy (CR) và dấu hợp quy',
      },
      {
        hsCode: '7208.39.90',
        descriptionVi: 'Thép cuộn cán nóng (HRC), chưa phủ, mạ hoặc tráng, dạng cuộn',
        descriptionEn: 'Flat-rolled products of iron or non-alloy steel, hot-rolled, in coils',
        unit: 'TNE',
        standardDutyRate: 10,
        mfnRate: 5,
        evftaRate: 0,
        cptppRate: 0,
        acftaRate: 0,
        atigaRate: 0,
        vkftaRate: 0,
        vatRate: 8,
        specializedInspection: 'Kiểm tra chất lượng thép nhập khẩu theo QCVN 16:2019/BXD',
        inspectionAgency: 'Chi cục Tiêu chuẩn Đo lường Chất lượng',
        importConditions: 'Có áp dụng thuế chống bán phá giá tạm thời nếu xuất xứ từ một số nước',
      },
    ];

    // 6. Dữ liệu phân tích Tài chính & Lợi nhuận gộp P&L từng lô hàng
    this.shipmentFinancials = [
      {
        shipmentId: 'shp-01',
        shipmentCode: 'EXP-2026-001',
        shipperName: 'Tập đoàn Dệt may Việt Nam (Vinatex)',
        carrierName: 'Maersk Line',
        currency: 'USD',
        sellingFreight: 2200,
        sellingLocalCharges: 350,
        totalRevenueVnd: 65161000,
        buyingFreight: 1750,
        buyingLocalCharges: 260,
        truckingCostVnd: 4500000,
        customsCostVnd: 1200000,
        portHandlingCostVnd: 1500000,
        totalCostVnd: 58454500,
        grossProfitVnd: 6706500,
        grossProfitUsd: 263.5,
        profitMarginPercent: 10.29,
        fxGainLossVnd: 450000,
        paymentStatus: 'PAID',
      },
      {
        shipmentId: 'shp-02',
        shipmentCode: 'IMP-2026-002',
        shipperName: 'Samsung Electronics Gumi Plant',
        carrierName: 'Korean Air Cargo',
        currency: 'USD',
        sellingFreight: 4850,
        sellingLocalCharges: 420,
        totalRevenueVnd: 134442600,
        buyingFreight: 4100,
        buyingLocalCharges: 310,
        truckingCostVnd: 3800000,
        customsCostVnd: 1500000,
        portHandlingCostVnd: 2200000,
        totalCostVnd: 119732500,
        grossProfitVnd: 14710100,
        grossProfitUsd: 577.9,
        profitMarginPercent: 10.94,
        fxGainLossVnd: 620000,
        paymentStatus: 'PAID',
      },
      {
        shipmentId: 'shp-03',
        shipmentCode: 'EXP-2026-003',
        shipperName: 'Công ty Cổ phần Thủy sản Minh Phú',
        carrierName: 'Ocean Network Express (ONE)',
        currency: 'USD',
        sellingFreight: 3600,
        sellingLocalCharges: 480,
        totalRevenueVnd: 104037600,
        buyingFreight: 2950,
        buyingLocalCharges: 380,
        truckingCostVnd: 6200000,
        customsCostVnd: 1800000,
        portHandlingCostVnd: 2800000,
        totalCostVnd: 95548500,
        grossProfitVnd: 8489100,
        grossProfitUsd: 333.5,
        profitMarginPercent: 8.16,
        fxGainLossVnd: -210000,
        paymentStatus: 'PARTIAL',
      },
      {
        shipmentId: 'shp-04',
        shipmentCode: 'CRB-2026-004',
        shipperName: 'Vina T&T Fruit Export',
        carrierName: 'VietRoute Cross-Border Fleet',
        currency: 'USD',
        sellingFreight: 1850,
        sellingLocalCharges: 180,
        totalRevenueVnd: 51866700,
        buyingFreight: 1300,
        buyingLocalCharges: 120,
        truckingCostVnd: 4200000,
        customsCostVnd: 950000,
        portHandlingCostVnd: 800000,
        totalCostVnd: 42139000,
        grossProfitVnd: 9727700,
        grossProfitUsd: 382.2,
        profitMarginPercent: 18.75,
        fxGainLossVnd: 180000,
        paymentStatus: 'PAID',
      },
      {
        shipmentId: 'shp-05',
        shipmentCode: 'IMP-2026-005',
        shipperName: 'BASF Coatings GmbH (Hamburg)',
        carrierName: 'Hapag-Lloyd',
        currency: 'EUR',
        sellingFreight: 3100,
        sellingLocalCharges: 390,
        totalRevenueVnd: 96494000,
        buyingFreight: 2600,
        buyingLocalCharges: 310,
        truckingCostVnd: 5500000,
        customsCostVnd: 2200000,
        portHandlingCostVnd: 2500000,
        totalCostVnd: 90691500,
        grossProfitVnd: 5802500,
        grossProfitUsd: 206.5,
        profitMarginPercent: 6.01,
        fxGainLossVnd: -350000,
        paymentStatus: 'UNPAID',
      },
    ];

    // 7. Theo dõi Tiền cược vỏ Container & Biên bản giao nhận EIR
    this.containerDeposits = [
      {
        id: 'dep-01',
        containerNo: 'MSKU8923410',
        shipmentCode: 'EXP-2026-001',
        carrier: 'Maersk Line',
        depositAmountVnd: 3000000,
        receiptNumber: 'EIR-MSK-2026-8812',
        depositedDate: '2026-09-24T08:30:00.000Z',
        refundDueDate: '2026-10-10T17:00:00.000Z',
        refundStatus: 'PENDING_REFUND',
        eirCondition: 'INTACT',
      },
      {
        id: 'dep-02',
        containerNo: 'ONEU7718923',
        shipmentCode: 'EXP-2026-003',
        carrier: 'Ocean Network Express (ONE)',
        depositAmountVnd: 5000000,
        receiptNumber: 'EIR-ONE-2026-4419',
        depositedDate: '2026-09-23T14:00:00.000Z',
        refundDueDate: '2026-10-08T17:00:00.000Z',
        refundStatus: 'PENDING_REFUND',
        eirCondition: 'INTACT',
      },
      {
        id: 'dep-03',
        containerNo: 'HLXU4819201',
        shipmentCode: 'IMP-2026-005',
        carrier: 'Hapag-Lloyd',
        depositAmountVnd: 3500000,
        receiptNumber: 'EIR-HL-2026-9021',
        depositedDate: '2026-09-21T10:00:00.000Z',
        refundDueDate: '2026-09-28T17:00:00.000Z',
        refundStatus: 'DEDUCTED_REPAIR',
        refundedAmountVnd: 2800000,
        deductedReason: 'Phát sinh vết móp sàn gỗ container (trừ 700.000 VNĐ theo biên bản EIR)',
        eirCondition: 'DENTED',
      },
      {
        id: 'dep-04',
        containerNo: 'TEMU3391820',
        shipmentCode: 'IMP-2026-002',
        carrier: 'Evergreen Line',
        depositAmountVnd: 3000000,
        receiptNumber: 'EIR-EMC-2026-1102',
        depositedDate: '2026-09-18T09:00:00.000Z',
        refundDueDate: '2026-09-25T17:00:00.000Z',
        refundStatus: 'REFUNDED_FULL',
        refundedAmountVnd: 3000000,
        eirCondition: 'INTACT',
      },
    ];

    // 8. Tọa độ Hải trình Vệ tinh AIS thời gian thực (Live Vessel AIS)
    this.vessels = [
      {
        vesselName: 'MAERSK MC-KINNEY MOLLER',
        mmsi: '219018271',
        imo: '9619907',
        flag: 'Denmark',
        shipmentCodes: ['EXP-2026-001'],
        currentLatitude: 14.8512,
        currentLongitude: 114.2831,
        speedKnots: 19.4,
        headingDegrees: 68,
        departurePort: 'VNSGN - Tân Cảng Cát Lái',
        destinationPort: 'USLAX - Port of Los Angeles',
        atdDate: '2026-09-26T16:00:00.000Z',
        etaPredicted: '2026-10-12T08:00:00.000Z',
        distanceCoveredNm: 1240,
        distanceRemainingNm: 6820,
        progressPercent: 15.38,
        weatherRisk: 'LOW_NORMAL',
        navStatus: 'UNDERWAY_USING_ENGINE',
      },
      {
        vesselName: 'ONE APUS',
        mmsi: '353136000',
        imo: '9806079',
        flag: 'Japan',
        shipmentCodes: ['EXP-2026-003'],
        currentLatitude: 10.3541,
        currentLongitude: 107.0189,
        speedKnots: 0.1,
        headingDegrees: 182,
        departurePort: 'VNSGN - Tân Cảng Cái Mép (TCIT)',
        destinationPort: 'DEHAM - Port of Hamburg',
        atdDate: '2026-09-28T02:00:00.000Z',
        etaPredicted: '2026-10-22T14:00:00.000Z',
        distanceCoveredNm: 0,
        distanceRemainingNm: 9200,
        progressPercent: 0,
        weatherRisk: 'LOW_NORMAL',
        navStatus: 'MOORED',
      },
      {
        vesselName: 'CMA CGM JACQUES SAADE',
        mmsi: '228386700',
        imo: '9839179',
        flag: 'France',
        shipmentCodes: ['IMP-2026-005'],
        currentLatitude: 12.1124,
        currentLongitude: 110.8932,
        speedKnots: 17.8,
        headingDegrees: 215,
        departurePort: 'DEHAM - Port of Hamburg',
        destinationPort: 'VNSGN - Cảng Tân Cảng Cát Lái',
        atdDate: '2026-09-08T10:00:00.000Z',
        etaPredicted: '2026-09-29T18:00:00.000Z',
        distanceCoveredNm: 8940,
        distanceRemainingNm: 380,
        progressPercent: 95.92,
        weatherRisk: 'MODERATE_SWELL',
        navStatus: 'UNDERWAY_USING_ENGINE',
      },
    ];

    // 9. Kho Chứng từ Xuất Nhập Khẩu Số Hóa
    this.shippingDocuments = [
      {
        id: 'doc-01',
        shipmentId: 'shp-01',
        shipmentCode: 'EXP-2026-001',
        documentType: 'BILL_OF_LADING',
        documentNumber: 'MAEU-881920192',
        issueDate: '2026-09-26T18:00:00.000Z',
        issuer: 'Maersk Line Vietnam Agency',
        fileFormat: 'PDF',
        status: 'VERIFIED',
        verificationNotes: 'Vận đơn gốc Seaway Bill sạch, đúng tên Shipper/Consignee',
        isMandatory: true,
      },
      {
        id: 'doc-02',
        shipmentId: 'shp-01',
        shipmentCode: 'EXP-2026-001',
        documentType: 'COMMERCIAL_INVOICE',
        documentNumber: 'INV-VTX-2026-091',
        issueDate: '2026-09-25T10:00:00.000Z',
        issuer: 'Vinatex Export Corp',
        fileFormat: 'PDF',
        status: 'VERIFIED',
        verificationNotes: 'Khớp trị giá 42,000 USD điều kiện FOB',
        isMandatory: true,
      },
      {
        id: 'doc-03',
        shipmentId: 'shp-01',
        shipmentCode: 'EXP-2026-001',
        documentType: 'PACKING_LIST',
        documentNumber: 'PL-VTX-2026-091',
        issueDate: '2026-09-25T10:30:00.000Z',
        issuer: 'Vinatex Export Corp',
        fileFormat: 'PDF',
        status: 'VERIFIED',
        verificationNotes: 'Đúng 480 cartons, Gross Weight 8,420 kg, 58.4 CBM',
        isMandatory: true,
      },
      {
        id: 'doc-04',
        shipmentId: 'shp-01',
        shipmentCode: 'EXP-2026-001',
        documentType: 'CERTIFICATE_OF_ORIGIN',
        documentNumber: 'CO-VCCI-2026-88192',
        issueDate: '2026-09-26T14:00:00.000Z',
        issuer: 'Phòng Thương Mại và Công Nghiệp Việt Nam (VCCI)',
        fileFormat: 'PDF',
        status: 'VERIFIED',
        verificationNotes: 'C/O Form B xuất khẩu thị trường Mỹ hợp lệ',
        isMandatory: false,
      },
      {
        id: 'doc-05',
        shipmentId: 'shp-03',
        shipmentCode: 'EXP-2026-003',
        documentType: 'CERTIFICATE_OF_ORIGIN',
        documentNumber: 'CO-EUR1-2026-44102',
        issueDate: '2026-09-27T09:00:00.000Z',
        issuer: 'Bộ Công Thương (Cục Xuất Nhập Khẩu)',
        fileFormat: 'PDF',
        status: 'VERIFIED',
        verificationNotes: 'C/O Form EUR.1 hưởng thuế suất ưu đãi EVFTA 0%',
        isMandatory: true,
      },
      {
        id: 'doc-06',
        shipmentId: 'shp-03',
        shipmentCode: 'EXP-2026-003',
        documentType: 'PHYTOSANITARY',
        documentNumber: 'HEALTH-NAFI-2026-119',
        issueDate: '2026-09-27T11:00:00.000Z',
        issuer: 'Cục Quản lý Chất lượng Nông lâm sản và Thủy sản (NAFIQPM)',
        fileFormat: 'PDF',
        status: 'ISSUED',
        verificationNotes: 'Đạt chỉ tiêu vi sinh và an toàn thực phẩm tiêu chuẩn EU',
        isMandatory: true,
      },
      {
        id: 'doc-07',
        shipmentId: 'shp-05',
        shipmentCode: 'IMP-2026-005',
        documentType: 'BILL_OF_LADING',
        documentNumber: 'HLCU-HAM-2026-091',
        issueDate: '2026-09-08T14:00:00.000Z',
        issuer: 'Hapag-Lloyd AG',
        fileFormat: 'PDF',
        status: 'VERIFIED',
        verificationNotes: 'Vận đơn Surrendered Bill đã nộp tiền cước đầu xuất',
        isMandatory: true,
      },
      {
        id: 'doc-08',
        shipmentId: 'shp-05',
        shipmentCode: 'IMP-2026-005',
        documentType: 'CERTIFICATE_OF_ORIGIN',
        documentNumber: 'CO-DE-2026-99120',
        issueDate: '2026-09-09T08:00:00.000Z',
        issuer: 'IHK Hamburg Chamber of Commerce',
        fileFormat: 'PDF',
        status: 'DRAFT',
        verificationNotes: 'Bản scan mờ, đang yêu cầu gửi lại bản gốc có xác thực điện tử',
        isMandatory: true,
      },
    ];

    // 10. Điều độ Xe Đầu Kéo Container Cảng - Kho (Port-to-Door Drayage)
    this.drayageDispatches = [
      {
        id: 'dsp-01',
        dispatchCode: 'DO-TRUCK-2601',
        shipmentCode: 'EXP-2026-001',
        containerNo: 'MSKU8841920',
        containerType: '40HC',
        dispatchType: 'DOOR_TO_PORT',
        pickupLocation: 'Kho Vinatex - KCN Sóng Thần, Dĩ An, Bình Dương',
        deliveryLocation: 'Cảng Tân Cảng Cát Lái - Cổng E (Hạ bãi xuất khẩu)',
        tractorPlate: '51C-881.92',
        trailerPlate: '51R-441.20',
        driverName: 'Nguyễn Văn Hùng',
        driverPhone: '0918.441.291',
        driverLicenseGrade: 'FC',
        appointmentTime: '2026-09-28T05:30:00.000Z',
        status: 'DISPATCHED',
        tollFeeVnd: 180000,
        fuelEstimatedLiters: 48,
        notes: 'Đã hoàn tất đóng hàng niêm phong chì seal ML-VN98412',
        createdAt: '2026-09-27T10:00:00.000Z',
      },
      {
        id: 'dsp-02',
        dispatchCode: 'DO-TRUCK-2602',
        shipmentCode: 'EXP-2026-003',
        containerNo: 'ONEU7718923',
        containerType: '40RF',
        dispatchType: 'DOOR_TO_PORT',
        pickupLocation: 'Kho Lạnh Minh Phú - KCN Sông Hậu, Hậu Giang',
        deliveryLocation: 'Cảng Cái Mép (TCIT) - Cổng Container Lạnh',
        tractorPlate: '50H-992.14',
        trailerPlate: '50R-331.09',
        driverName: 'Trần Đình Trọng',
        driverPhone: '0903.882.119',
        driverLicenseGrade: 'FC',
        appointmentTime: '2026-09-28T02:00:00.000Z',
        status: 'PULLED_FROM_PORT',
        tollFeeVnd: 280000,
        fuelEstimatedLiters: 92,
        notes: 'Xe có gắn máy phát GenSet bảo đảm nhiệt độ âm sâu -18°C',
        createdAt: '2026-09-27T11:00:00.000Z',
      },
      {
        id: 'dsp-03',
        dispatchCode: 'DO-TRUCK-2603',
        shipmentCode: 'IMP-2026-005',
        containerNo: 'HLXU4819201',
        containerType: '40HC',
        dispatchType: 'PORT_TO_DOOR',
        pickupLocation: 'Bãi Cảng Cát Lái (Sau thông quan hải quan)',
        deliveryLocation: 'Nhà máy Sơn BASF - KCN Amata, Đồng Nai',
        tractorPlate: '60C-442.88',
        trailerPlate: '60R-221.75',
        driverName: 'Lê Hoàng Nam',
        driverPhone: '0978.112.554',
        driverLicenseGrade: 'FC',
        appointmentTime: '2026-09-29T21:30:00.000Z',
        status: 'PENDING_DISPATCH',
        tollFeeVnd: 150000,
        fuelEstimatedLiters: 42,
        notes: 'Chạy khung giờ đêm tránh giờ cấm tải xe container trên Xa lộ Hà Nội',
        createdAt: '2026-09-27T14:30:00.000Z',
      },
    ];
  }

  // ================= SHIPMENTS API =================
  async getShipments(params?: {
    direction?: string;
    mode?: string;
    incoterm?: string;
    status?: string;
    search?: string;
  }) {
    let list = [...this.shipments];

    if (params?.direction && params.direction !== 'ALL') {
      list = list.filter((s) => s.direction === params.direction);
    }
    if (params?.mode && params.mode !== 'ALL') {
      list = list.filter((s) => s.transportMode === params.mode);
    }
    if (params?.incoterm && params.incoterm !== 'ALL') {
      list = list.filter((s) => s.incoterm === params.incoterm);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((s) => s.status === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.shipmentCode.toLowerCase().includes(q) ||
          s.blAwbNumber.toLowerCase().includes(q) ||
          (s.containerNumber && s.containerNumber.toLowerCase().includes(q)) ||
          s.carrierName.toLowerCase().includes(q) ||
          s.shipperName.toLowerCase().includes(q) ||
          s.consigneeName.toLowerCase().includes(q) ||
          s.polPort.toLowerCase().includes(q) ||
          s.podPort.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async getShipmentById(id: string) {
    const item = this.shipments.find((s) => s.id === id || s.shipmentCode === id);
    if (!item) {
      throw new NotFoundException(`Không tìm thấy lô hàng quốc tế ${id}`);
    }
    return item;
  }

  async createShipment(dto: CreateInternationalShipmentDto) {
    const existing = this.shipments.find((s) => s.shipmentCode === dto.shipmentCode.trim().toUpperCase());
    if (existing) {
      throw new BadRequestException(`Mã lô hàng "${dto.shipmentCode}" đã tồn tại`);
    }

    const newShipment: InternationalShipment = {
      id: `shp-${Date.now()}`,
      shipmentCode: dto.shipmentCode.trim().toUpperCase(),
      direction: dto.direction,
      transportMode: dto.transportMode,
      incoterm: dto.incoterm,
      carrierName: dto.carrierName.trim(),
      vesselFlightNo: dto.vesselFlightNo?.trim() || 'Chưa xếp tàu/chuyến',
      polPort: dto.polPort,
      podPort: dto.podPort,
      etdDate: dto.etdDate || new Date().toISOString(),
      etaDate: dto.etaDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      blAwbNumber: dto.blAwbNumber?.trim() || `BL-${Date.now().toString().slice(-6)}`,
      containerNumber: dto.containerNumber?.trim(),
      sealNumber: dto.sealNumber?.trim(),
      containerType: dto.containerType || '40HC',
      grossWeightKg: dto.grossWeightKg || 1000,
      cbmVolume: dto.cbmVolume || 10,
      packageCount: dto.packageCount || 50,
      shipperName: dto.shipperName?.trim() || 'Shipper Quốc Tế',
      consigneeName: dto.consigneeName?.trim() || 'Consignee Nhập Khẩu',
      currency: dto.currency || 'USD',
      freightAmount: dto.freightAmount || 1500,
      customsStatus: 'NOT_FILED',
      status: (dto.status as any) || 'BOOKING_CONFIRMED',
      notes: dto.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.shipments.unshift(newShipment);
    return newShipment;
  }

  async updateShipment(id: string, dto: Partial<CreateInternationalShipmentDto>) {
    const index = this.shipments.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy lô hàng ${id}`);
    }

    const current = this.shipments[index];
    const updated: InternationalShipment = {
      ...current,
      ...(dto.direction && { direction: dto.direction }),
      ...(dto.transportMode && { transportMode: dto.transportMode }),
      ...(dto.incoterm && { incoterm: dto.incoterm }),
      ...(dto.carrierName && { carrierName: dto.carrierName }),
      ...(dto.vesselFlightNo !== undefined && { vesselFlightNo: dto.vesselFlightNo }),
      ...(dto.polPort && { polPort: dto.polPort }),
      ...(dto.podPort && { podPort: dto.podPort }),
      ...(dto.etdDate && { etdDate: dto.etdDate }),
      ...(dto.etaDate && { etaDate: dto.etaDate }),
      ...(dto.blAwbNumber && { blAwbNumber: dto.blAwbNumber }),
      ...(dto.containerNumber !== undefined && { containerNumber: dto.containerNumber }),
      ...(dto.sealNumber !== undefined && { sealNumber: dto.sealNumber }),
      ...(dto.grossWeightKg !== undefined && { grossWeightKg: dto.grossWeightKg }),
      ...(dto.cbmVolume !== undefined && { cbmVolume: dto.cbmVolume }),
      ...(dto.packageCount !== undefined && { packageCount: dto.packageCount }),
      ...(dto.shipperName && { shipperName: dto.shipperName }),
      ...(dto.consigneeName && { consigneeName: dto.consigneeName }),
      ...(dto.currency && { currency: dto.currency }),
      ...(dto.freightAmount !== undefined && { freightAmount: dto.freightAmount }),
      ...(dto.status && { status: dto.status as any }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
      updatedAt: new Date().toISOString(),
    };

    this.shipments[index] = updated;
    return updated;
  }

  async deleteShipment(id: string) {
    const index = this.shipments.findIndex((s) => s.id === id);
    if (index === -1) {
      throw new NotFoundException(`Không tìm thấy lô hàng ${id}`);
    }
    const item = this.shipments[index];
    this.shipments.splice(index, 1);
    return { success: true, message: `Đã xóa lô hàng ${item.shipmentCode}` };
  }

  // ================= CUSTOMS DECLARATIONS API =================
  async getCustomsDeclarations(params?: { channel?: string; status?: string; search?: string }) {
    let list = [...this.customsDeclarations];

    if (params?.channel && params.channel !== 'ALL') {
      list = list.filter((c) => c.channel === params.channel);
    }
    if (params?.status && params.status !== 'ALL') {
      list = list.filter((c) => c.status === params.status);
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (c) =>
          c.declarationNo.includes(q) ||
          c.shipmentCode.toLowerCase().includes(q) ||
          c.customsBranch.toLowerCase().includes(q) ||
          c.hsCode.includes(q) ||
          c.commodityDescription.toLowerCase().includes(q)
      );
    }

    return list;
  }

  async createCustomsDeclaration(dto: CreateCustomsDeclarationDto) {
    const existing = this.customsDeclarations.find((c) => c.declarationNo === dto.declarationNo.trim());
    if (existing) {
      throw new BadRequestException(`Số tờ khai hải quan "${dto.declarationNo}" đã tồn tại`);
    }

    const newDecl: CustomsDeclaration = {
      id: `cst-${Date.now()}`,
      declarationNo: dto.declarationNo.trim(),
      shipmentId: dto.shipmentId,
      shipmentCode: dto.shipmentId, // or lookup from shipments
      customsBranch: dto.customsBranch,
      declarationType: dto.declarationType,
      channel: dto.channel,
      hsCode: dto.hsCode || '8471.30.20',
      commodityDescription: dto.commodityDescription || 'Hàng hóa xuất nhập khẩu tiêu chuẩn',
      invoiceValue: dto.invoiceValue || 10000,
      currency: dto.currency || 'USD',
      importTaxAmount: dto.importTaxAmount || 0,
      vatTaxAmount: dto.vatTaxAmount || 0,
      status: dto.status || 'REGISTERED',
      registeredDate: dto.registeredDate || new Date().toISOString(),
      clearedDate: dto.status === 'CLEARED' ? new Date().toISOString() : undefined,
    };

    // Cập nhật trạng thái hải quan trên Shipment
    const shipment = this.shipments.find((s) => s.id === dto.shipmentId || s.shipmentCode === dto.shipmentId);
    if (shipment) {
      newDecl.shipmentCode = shipment.shipmentCode;
      shipment.customsStatus = dto.channel === 'GREEN' ? 'CLEARED' : dto.channel;
      if (dto.status === 'CLEARED') {
        shipment.status = 'CUSTOMS_CLEARED';
      }
    }

    this.customsDeclarations.unshift(newDecl);
    return newDecl;
  }

  async updateCustomsStatus(id: string, status: 'DRAFT' | 'REGISTERED' | 'CLEARED' | 'REJECTED') {
    const decl = this.customsDeclarations.find((c) => c.id === id);
    if (!decl) throw new NotFoundException('Không tìm thấy tờ khai');
    decl.status = status;
    if (status === 'CLEARED') {
      decl.clearedDate = new Date().toISOString();
      const shipment = this.shipments.find((s) => s.shipmentCode === decl.shipmentCode);
      if (shipment) {
        shipment.customsStatus = 'CLEARED';
        shipment.status = 'CUSTOMS_CLEARED';
      }
    }
    return decl;
  }

  // ================= CONTAINERS & RATES API =================
  async getContainers() {
    return this.containers;
  }

  async getPorts() {
    return this.ports;
  }

  async getExchangeRates() {
    return this.exchangeRates;
  }

  async getLocalCharges() {
    return this.localCharges;
  }

  // ================= SMART HS CODE & FTA TAX ENGINE =================
  async searchHsCodes(query?: string) {
    if (!query || !query.trim()) return this.hsCodes;
    const q = query.trim().toLowerCase();
    return this.hsCodes.filter(
      (item) =>
        item.hsCode.toLowerCase().includes(q) ||
        item.descriptionVi.toLowerCase().includes(q) ||
        item.descriptionEn.toLowerCase().includes(q) ||
        (item.specializedInspection && item.specializedInspection.toLowerCase().includes(q))
    );
  }

  async calculateFtaTaxes(dto: {
    hsCode: string;
    invoiceValue: number;
    currency: string;
    originFta?: string;
  }) {
    const item = this.hsCodes.find((h) => h.hsCode === dto.hsCode) || this.hsCodes[0];
    const rateUsd = 25450;
    const valueVnd = (dto.currency === 'USD' ? dto.invoiceValue : dto.invoiceValue * 1.1) * rateUsd;

    // Xác định thuế suất theo Hiệp định FTA
    let applicableDutyRate = item.mfnRate;
    let ftaName = 'MFN (Tối huệ quốc)';

    switch (dto.originFta) {
      case 'EVFTA':
        applicableDutyRate = item.evftaRate;
        ftaName = 'EVFTA (Việt Nam - Liên minh Châu Âu EU)';
        break;
      case 'CPTPP':
        applicableDutyRate = item.cptppRate;
        ftaName = 'CPTPP (Hiệp định Đối tác Toàn diện và Tiến bộ)';
        break;
      case 'ACFTA':
        applicableDutyRate = item.acftaRate;
        ftaName = 'ACFTA Form E (ASEAN - Trung Quốc)';
        break;
      case 'ATIGA':
        applicableDutyRate = item.atigaRate;
        ftaName = 'ATIGA Form D (Nội khối ASEAN)';
        break;
      case 'VKFTA':
        applicableDutyRate = item.vkftaRate;
        ftaName = 'VKFTA Form AK (Việt Nam - Hàn Quốc)';
        break;
      default:
        applicableDutyRate = item.mfnRate;
    }

    const standardDutyVnd = (valueVnd * item.standardDutyRate) / 100;
    const mfnDutyVnd = (valueVnd * item.mfnRate) / 100;
    const applicableDutyVnd = (valueVnd * applicableDutyRate) / 100;
    const vatVnd = ((valueVnd + applicableDutyVnd) * item.vatRate) / 100;
    const totalTaxVnd = applicableDutyVnd + vatVnd;
    const dutySavingsVnd = standardDutyVnd - applicableDutyVnd;

    return {
      hsCode: item.hsCode,
      descriptionVi: item.descriptionVi,
      ftaName,
      applicableDutyRate,
      mfnRate: item.mfnRate,
      standardDutyRate: item.standardDutyRate,
      vatRate: item.vatRate,
      cifValueVnd: Math.round(valueVnd),
      applicableDutyVnd: Math.round(applicableDutyVnd),
      vatVnd: Math.round(vatVnd),
      totalTaxVnd: Math.round(totalTaxVnd),
      dutySavingsVnd: Math.round(dutySavingsVnd),
      specializedInspection: item.specializedInspection,
      inspectionAgency: item.inspectionAgency,
      importConditions: item.importConditions,
    };
  }

  // ================= SHIPMENT FINANCIALS P&L =================
  async getShipmentFinancials() {
    return this.shipmentFinancials;
  }

  // ================= CONTAINER DEPOSITS & EIR =================
  async getContainerDeposits() {
    return this.containerDeposits;
  }

  async refundContainerDeposit(
    id: string,
    dto: {
      status: 'REFUNDED_FULL' | 'DEDUCTED_REPAIR';
      refundedAmountVnd?: number;
      deductedReason?: string;
    }
  ) {
    const deposit = this.containerDeposits.find((d) => d.id === id);
    if (!deposit) throw new NotFoundException('Không tìm thấy thông tin tiền cược vỏ');
    deposit.refundStatus = dto.status;
    deposit.refundedAmountVnd =
      dto.refundedAmountVnd !== undefined
        ? dto.refundedAmountVnd
        : dto.status === 'REFUNDED_FULL'
        ? deposit.depositAmountVnd
        : deposit.depositAmountVnd - 500000;
    if (dto.deductedReason) deposit.deductedReason = dto.deductedReason;
    return deposit;
  }

  // ================= LIVE AIS VESSEL TRACKING =================
  async getVesselTracking() {
    return this.vessels;
  }

  // ================= SHIPPING DOCUMENTS VAULT =================
  async getShippingDocuments(shipmentCode?: string) {
    if (shipmentCode) {
      return this.shippingDocuments.filter((d) => d.shipmentCode === shipmentCode);
    }
    return this.shippingDocuments;
  }

  async verifyShippingDocument(
    id: string,
    dto: { status: 'VERIFIED' | 'REJECTED'; verificationNotes?: string }
  ) {
    const doc = this.shippingDocuments.find((d) => d.id === id);
    if (!doc) throw new NotFoundException('Không tìm thấy chứng từ xuất nhập khẩu');
    doc.status = dto.status;
    if (dto.verificationNotes) doc.verificationNotes = dto.verificationNotes;
    return doc;
  }

  // ================= CONTAINER DRAYAGE DISPATCH =================
  async getDrayageDispatches(shipmentCode?: string) {
    if (shipmentCode) {
      return this.drayageDispatches.filter((d) => d.shipmentCode === shipmentCode);
    }
    return this.drayageDispatches;
  }

  async createDrayageDispatch(dto: Partial<ContainerDrayageDispatchItem>) {
    const newDispatch: ContainerDrayageDispatchItem = {
      id: `dsp-${Date.now()}`,
      dispatchCode: `DO-TRUCK-${Date.now().toString().slice(-4)}`,
      shipmentCode: dto.shipmentCode || 'IMP-2026-005',
      containerNo: dto.containerNo || 'HLXU4819201',
      containerType: dto.containerType || '40HC',
      dispatchType: dto.dispatchType || 'PORT_TO_DOOR',
      pickupLocation: dto.pickupLocation || 'Cảng Tân Cảng Cát Lái',
      deliveryLocation: dto.deliveryLocation || 'Kho Nhà Máy',
      tractorPlate: dto.tractorPlate || '51C-881.92',
      trailerPlate: dto.trailerPlate || '51R-441.20',
      driverName: dto.driverName || 'Nguyễn Văn Hùng',
      driverPhone: dto.driverPhone || '0918.441.291',
      driverLicenseGrade: 'FC',
      appointmentTime: dto.appointmentTime || new Date(Date.now() + 86400000).toISOString(),
      status: 'DISPATCHED',
      tollFeeVnd: dto.tollFeeVnd || 180000,
      fuelEstimatedLiters: dto.fuelEstimatedLiters || 45,
      notes: dto.notes,
      createdAt: new Date().toISOString(),
    };
    this.drayageDispatches.unshift(newDispatch);
    return newDispatch;
  }

  async updateDrayageStatus(
    id: string,
    status: 'PENDING_DISPATCH' | 'DISPATCHED' | 'PULLED_FROM_PORT' | 'DELIVERED_FACTORY' | 'COMPLETED'
  ) {
    const item = this.drayageDispatches.find((d) => d.id === id);
    if (!item) throw new NotFoundException('Không tìm thấy lệnh điều độ xe');
    item.status = status;
    return item;
  }

  // ================= AI IMPORT ANALYSIS & AUTO-DISPATCH =================
  async getAiImportAnalysis(shipmentCode: string): Promise<AiImportAnalysisReport> {
    const shipment = this.shipments.find((s) => s.shipmentCode === shipmentCode) || this.shipments[0];
    const isCustomsCleared = shipment.customsStatus === 'CLEARED';
    const isReefer = shipment.containerType?.includes('RF');

    return {
      shipmentCode: shipment.shipmentCode,
      analyzedAt: new Date().toISOString(),
      overallRiskScore: isCustomsCleared ? 18 : 64,
      riskLevel: isCustomsCleared ? 'LOW_SAFE' : 'MEDIUM_CAUTION',
      portCongestionPrediction: {
        portCode: 'VNSGN',
        portName: shipment.podPort || 'Cảng Tân Cảng Cát Lái',
        congestionLevelPercent: 78,
        averageVesselWaitingTimeHours: 6.5,
        recommendedDrayageWindow: '21:30 - 05:00 (Tránh giờ cấm tải container TP.HCM & kẹt cổng cảng)',
      },
      customsRiskAssessment: {
        channelPrediction: isCustomsCleared ? 'GREEN' : 'YELLOW',
        auditProbabilityPercent: isCustomsCleared ? 5 : 45,
        complianceFlags: [
          isReefer ? 'Hàng đông lạnh: Yêu cầu kiểm dịch thú y/thực vật trước khi mở tờ khai' : 'Mã HS hợp lệ, khớp mô tả hóa đơn',
          'Doanh nghiệp có lịch sử tuân thủ pháp luật hải quan loại 2 (Trung bình)',
        ],
        potentialPenaltyWarning: isCustomsCleared ? undefined : 'Cần bổ sung chứng nhận C/O bản gốc để hưởng thuế suất ưu đãi 0%',
      },
      demurrageAvoidancePlan: {
        freeTimeRemainingDays: 4,
        dailyPenaltyVnd: isReefer ? 2150000 : 1250000,
        maxSafeStorageDate: new Date(Date.now() + 4 * 86400000).toLocaleDateString('vi-VN'),
        recommendedAction: 'Điều xe kéo container lấy hàng trong khung giờ đêm trước 05:00 sáng mai',
      },
      landedCostBreakdown: {
        fobValueVnd: Math.round(shipment.freightAmount * 25450 * 5.2),
        freightAndInsuranceVnd: Math.round(shipment.freightAmount * 25450),
        importTaxAndVatVnd: Math.round(shipment.freightAmount * 25450 * 0.18),
        portAndLocalChargesVnd: 5400000,
        inlandDrayageTruckingVnd: 4200000,
        totalLandedCostVnd: Math.round(shipment.freightAmount * 25450 * 6.6) + 9600000,
        costPerUnitVnd: Math.round((shipment.freightAmount * 25450 * 6.6 + 9600000) / Math.max(1, shipment.packageCount)),
        unitName: shipment.packageCount > 100 ? 'Carton' : 'Kiện / Unit',
      },
      aiRecommendations: [
        'Khung giờ điều xe tối ưu nhất: 22:00 - 04:30 qua tuyến Xa lộ Hà Nội - Mai Chí Thọ để giảm 25% thời gian chờ cổng cảng.',
        isReefer ? 'Lưu ý bắt buộc: Rơ-moóc kéo cont cần trang bị máy phát điện GenSet duy trì nhiệt độ âm -18°C suốt quá trình vận chuyển.' : 'Container 40HC khô: Kiểm tra kỹ tem niêm phong chì hãng tàu trước khi rời bãi cảng.',
        'Kích hoạt lệnh điều độ tự động (Auto-Dispatch) để khóa xe đầu kéo 51C-881.92 và tài xế hạng FC sẵn sàng vào cảng.',
      ],
    };
  }

  async runAiAutoDispatch(shipmentCode: string) {
    const analysis = await this.getAiImportAnalysis(shipmentCode);
    const existing = this.drayageDispatches.find((d) => d.shipmentCode === shipmentCode);

    if (existing) {
      existing.status = 'DISPATCHED';
      existing.appointmentTime = new Date().toISOString();
      return { dispatch: existing, analysis };
    }

    const newDispatch: ContainerDrayageDispatchItem = {
      id: `dsp-ai-${Date.now()}`,
      dispatchCode: `DO-AI-${Date.now().toString().slice(-4)}`,
      shipmentCode,
      containerNo: 'AUTO-CONT-8819',
      containerType: '40HC',
      dispatchType: 'PORT_TO_DOOR',
      pickupLocation: analysis.portCongestionPrediction.portName,
      deliveryLocation: 'Kho Nhà Máy Consignee',
      tractorPlate: '51C-881.92',
      trailerPlate: '51R-441.20',
      driverName: 'Nguyễn Văn Hùng (AI Matched)',
      driverPhone: '0918.441.291',
      driverLicenseGrade: 'FC',
      appointmentTime: 'Khung giờ đêm: 22:00 - 04:30 (Tránh cấm tải)',
      status: 'DISPATCHED',
      tollFeeVnd: 180000,
      fuelEstimatedLiters: 45,
      notes: 'Được điều phối tự động bởi thuật toán AI Smart Drayage Dispatcher',
      createdAt: new Date().toISOString(),
    };

    this.drayageDispatches.unshift(newDispatch);
    return { dispatch: newDispatch, analysis };
  }

  async createShippingDocument(dto: Partial<ShippingDocument>) {
    const newDoc: ShippingDocument = {
      id: `doc-${Date.now()}`,
      shipmentId: dto.shipmentId || 'shp-custom',
      shipmentCode: dto.shipmentCode || 'EXP-2026-001',
      documentType: dto.documentType || 'BILL_OF_LADING',
      documentNumber: dto.documentNumber || `DOC-${Date.now().toString().slice(-6)}`,
      issueDate: dto.issueDate || new Date().toISOString(),
      issuer: dto.issuer || 'Đơn vị phát hành',
      fileFormat: dto.fileFormat || 'PDF',
      status: dto.status || 'ISSUED',
      verificationNotes: dto.verificationNotes,
      isMandatory: dto.isMandatory !== undefined ? dto.isMandatory : true,
    };
    this.shippingDocuments.unshift(newDoc);
    return newDoc;
  }

  async deleteShippingDocument(id: string) {
    const prev = this.shippingDocuments.length;
    this.shippingDocuments = this.shippingDocuments.filter((d) => d.id !== id);
    return this.shippingDocuments.length < prev;
  }

  async createLocalCharge(dto: LocalChargeItem) {
    const existing = this.localCharges.find((c) => c.code === dto.code);
    if (existing) {
      existing.name = dto.name;
      existing.description = dto.description;
      existing.amount = dto.amount;
      existing.currency = dto.currency;
      existing.appliedUnit = dto.appliedUnit;
      return existing;
    }
    this.localCharges.push(dto);
    return dto;
  }

  async updateExchangeRates(rates: ExchangeRateItem[]) {
    this.exchangeRates = rates.map((r) => ({
      ...r,
      updatedAt: new Date().toISOString(),
    }));
    return this.exchangeRates;
  }
}


