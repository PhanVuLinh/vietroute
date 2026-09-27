import type {
  InternationalShipment,
  CustomsDeclaration,
  ContainerTrackingItem,
  InternationalPort,
  ExchangeRateItem,
  LocalChargeItem,
  InternationalFilterParams,
  CreateShipmentInput,
  CreateCustomsInput,
} from '@/modules/international/types/international';

let mockShipments: InternationalShipment[] = [
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

let mockCustoms: CustomsDeclaration[] = [
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
    importTaxAmount: 0,
    vatTaxAmount: 225675000,
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

let mockContainers: ContainerTrackingItem[] = [
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
    overdueDays: 1,
    estimatedPenaltyAmountVnd: 1250000,
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

const mockPorts: InternationalPort[] = [
  { code: 'VNSGN', name: 'Cảng Tân Cảng Cát Lái', country: 'Việt Nam', city: 'TP. Hồ Chí Minh', type: 'SEAPORT' },
  { code: 'VNHPH', name: 'Cảng Hải Phòng (Lạch Huyện / Đình Vũ)', country: 'Việt Nam', city: 'Hải Phòng', type: 'SEAPORT' },
  { code: 'VNDAD', name: 'Cảng Tiên Sa Đà Nẵng', country: 'Việt Nam', city: 'Đà Nẵng', type: 'SEAPORT' },
  { code: 'SGN', name: 'Sân bay Quốc tế Tân Sơn Nhất Cargo', country: 'Việt Nam', city: 'TP. Hồ Chí Minh', type: 'AIRPORT' },
  { code: 'HAN', name: 'Sân bay Quốc tế Nội Bài Cargo', country: 'Việt Nam', city: 'Hà Nội', type: 'AIRPORT' },
  { code: 'VNHNI', name: 'Cửa khẩu Quốc tế Hữu Nghị', country: 'Việt Nam', city: 'Lạng Sơn', type: 'BORDER_GATE' },
  { code: 'USLAX', name: 'Port of Los Angeles', country: 'Hoa Kỳ (USA)', city: 'Los Angeles', type: 'SEAPORT' },
  { code: 'USNYC', name: 'Port of New York & New Jersey', country: 'Hoa Kỳ (USA)', city: 'New York', type: 'SEAPORT' },
  { code: 'CNSHA', name: 'Port of Shanghai (Thượng Hải)', country: 'Trung Quốc', city: 'Thượng Hải', type: 'SEAPORT' },
  { code: 'CNNBO', name: 'Port of Ningbo-Zhoushan (Ninh Ba)', country: 'Trung Quốc', city: 'Chiết Giang', type: 'SEAPORT' },
  { code: 'SGSIN', name: 'Port of Singapore', country: 'Singapore', city: 'Singapore', type: 'SEAPORT' },
  { code: 'DEHAM', name: 'Port of Hamburg', country: 'Đức (Germany)', city: 'Hamburg', type: 'SEAPORT' },
  { code: 'FRA', name: 'Frankfurt Airport Cargo Terminal', country: 'Đức (Germany)', city: 'Frankfurt', type: 'AIRPORT' },
  { code: 'NRT', name: 'Tokyo Narita Airport', country: 'Nhật Bản', city: 'Tokyo', type: 'AIRPORT' },
];

const mockExchangeRates: ExchangeRateItem[] = [
  { currency: 'USD', name: 'Đô la Mỹ', buyRateVnd: 25420, transferRateVnd: 25450, sellRateVnd: 25780, updatedAt: new Date().toISOString() },
  { currency: 'EUR', name: 'Đồng Euro', buyRateVnd: 27580, transferRateVnd: 27650, sellRateVnd: 28100, updatedAt: new Date().toISOString() },
  { currency: 'CNY', name: 'Nhân dân tệ Trung Quốc', buyRateVnd: 3510, transferRateVnd: 3530, sellRateVnd: 3620, updatedAt: new Date().toISOString() },
  { currency: 'JPY', name: 'Yên Nhật', buyRateVnd: 165.2, transferRateVnd: 166.5, sellRateVnd: 171.8, updatedAt: new Date().toISOString() },
  { currency: 'SGD', name: 'Đô la Singapore', buyRateVnd: 19150, transferRateVnd: 19220, sellRateVnd: 19600, updatedAt: new Date().toISOString() },
];

const mockLocalCharges: LocalChargeItem[] = [
  { code: 'THC', name: 'Terminal Handling Charge', description: 'Phí bốc xếp container từ cầu tàu lên bãi cảng', amount: 155, currency: 'USD', appliedUnit: 'Per 40HC' },
  { code: 'D/O', name: 'Delivery Order Fee', description: 'Phí phát hành lệnh giao hàng cho chủ hàng nhập khẩu', amount: 45, currency: 'USD', appliedUnit: 'Per Bill' },
  { code: 'CFS', name: 'Container Freight Station', description: 'Phí bốc dỡ và lưu kho cho hàng lẻ đóng ghép LCL', amount: 18, currency: 'USD', appliedUnit: 'Per CBM' },
  { code: 'CIC', name: 'Container Imbalance Charge', description: 'Phí phụ trội bù đắp chi phí điều chuyển vỏ rỗng', amount: 80, currency: 'USD', appliedUnit: 'Per Container' },
  { code: 'SEAL', name: 'Seal Fee', description: 'Phí kẹp chì niêm phong bảo mật hải quan', amount: 10, currency: 'USD', appliedUnit: 'Per Seal' },
  { code: 'AMS', name: 'Automated Manifest System', description: 'Phí truyền dữ liệu tờ khai an ninh điện tử vào hải quan Hoa Kỳ', amount: 35, currency: 'USD', appliedUnit: 'Per Bill' },
];

export const mockInternationalService = {
  getShipments: async (params?: InternationalFilterParams): Promise<InternationalShipment[]> => {
    let list = [...mockShipments];
    if (params?.direction && params.direction !== 'ALL') list = list.filter((s) => s.direction === params.direction);
    if (params?.mode && params.mode !== 'ALL') list = list.filter((s) => s.transportMode === params.mode);
    if (params?.incoterm && params.incoterm !== 'ALL') list = list.filter((s) => s.incoterm === params.incoterm);
    if (params?.status && params.status !== 'ALL') list = list.filter((s) => s.status === params.status);
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.shipmentCode.toLowerCase().includes(q) ||
          s.blAwbNumber.toLowerCase().includes(q) ||
          (s.containerNumber && s.containerNumber.toLowerCase().includes(q)) ||
          s.carrierName.toLowerCase().includes(q) ||
          s.shipperName.toLowerCase().includes(q) ||
          s.consigneeName.toLowerCase().includes(q)
      );
    }
    return list;
  },

  getShipmentById: async (id: string): Promise<InternationalShipment | null> => {
    return mockShipments.find((s) => s.id === id || s.shipmentCode === id) || null;
  },

  createShipment: async (data: CreateShipmentInput): Promise<InternationalShipment> => {
    const newShipment: InternationalShipment = {
      id: `shp-${Date.now()}`,
      shipmentCode: data.shipmentCode.toUpperCase().trim(),
      direction: data.direction,
      transportMode: data.transportMode,
      incoterm: data.incoterm,
      carrierName: data.carrierName,
      vesselFlightNo: data.vesselFlightNo || 'TBA',
      polPort: data.polPort,
      podPort: data.podPort,
      etdDate: data.etdDate || new Date().toISOString(),
      etaDate: data.etaDate || new Date(Date.now() + 14 * 86400000).toISOString(),
      blAwbNumber: data.blAwbNumber || `BL-${Date.now().toString().slice(-6)}`,
      containerNumber: data.containerNumber,
      sealNumber: data.sealNumber,
      containerType: data.containerType || '40HC',
      grossWeightKg: data.grossWeightKg || 1000,
      cbmVolume: data.cbmVolume || 10,
      packageCount: data.packageCount || 50,
      shipperName: data.shipperName || 'Shipper Quốc Tế',
      consigneeName: data.consigneeName || 'Consignee Nhập Khẩu',
      currency: data.currency || 'USD',
      freightAmount: data.freightAmount || 1500,
      customsStatus: 'NOT_FILED',
      status: (data.status as any) || 'BOOKING_CONFIRMED',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockShipments.unshift(newShipment);
    return newShipment;
  },

  updateShipment: async (id: string, data: Partial<CreateShipmentInput>): Promise<InternationalShipment> => {
    const idx = mockShipments.findIndex((s) => s.id === id);
    if (idx === -1) throw new Error('Không tìm thấy lô hàng');
    mockShipments[idx] = {
      ...mockShipments[idx],
      ...data,
      status: (data.status as any) || mockShipments[idx].status,
      updatedAt: new Date().toISOString(),
    };
    return mockShipments[idx];
  },

  deleteShipment: async (id: string): Promise<boolean> => {
    const prev = mockShipments.length;
    mockShipments = mockShipments.filter((s) => s.id !== id);
    return mockShipments.length < prev;
  },

  getCustomsDeclarations: async (params?: { channel?: string; status?: string; search?: string }): Promise<CustomsDeclaration[]> => {
    let list = [...mockCustoms];
    if (params?.channel && params.channel !== 'ALL') list = list.filter((c) => c.channel === params.channel);
    if (params?.status && params.status !== 'ALL') list = list.filter((c) => c.status === params.status);
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter((c) => c.declarationNo.includes(q) || c.shipmentCode.toLowerCase().includes(q) || c.hsCode.includes(q));
    }
    return list;
  },

  createCustomsDeclaration: async (data: CreateCustomsInput): Promise<CustomsDeclaration> => {
    const newDecl: CustomsDeclaration = {
      id: `cst-${Date.now()}`,
      declarationNo: data.declarationNo,
      shipmentId: data.shipmentId,
      shipmentCode: data.shipmentId,
      customsBranch: data.customsBranch,
      declarationType: data.declarationType,
      channel: data.channel,
      hsCode: data.hsCode || '8471.30.20',
      commodityDescription: data.commodityDescription || 'Hàng hóa xuất nhập khẩu',
      invoiceValue: data.invoiceValue || 10000,
      currency: data.currency || 'USD',
      importTaxAmount: data.importTaxAmount || 0,
      vatTaxAmount: data.vatTaxAmount || 0,
      status: data.status || 'REGISTERED',
      registeredDate: new Date().toISOString(),
      clearedDate: data.status === 'CLEARED' ? new Date().toISOString() : undefined,
    };
    mockCustoms.unshift(newDecl);
    return newDecl;
  },

  getContainers: async (): Promise<ContainerTrackingItem[]> => {
    return mockContainers;
  },

  getPorts: async (): Promise<InternationalPort[]> => {
    return mockPorts;
  },

  getExchangeRates: async (): Promise<ExchangeRateItem[]> => {
    return mockExchangeRates;
  },

  getLocalCharges: async (): Promise<LocalChargeItem[]> => {
    return mockLocalCharges;
  },
};
