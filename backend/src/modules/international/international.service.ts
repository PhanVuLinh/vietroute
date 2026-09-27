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

@Injectable()
export class InternationalService implements OnModuleInit {
  private shipments: InternationalShipment[] = [];
  private customsDeclarations: CustomsDeclaration[] = [];
  private containers: ContainerTrackingItem[] = [];
  private ports: InternationalPort[] = [];
  private exchangeRates: ExchangeRateItem[] = [];
  private localCharges: LocalChargeItem[] = [];

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
}
