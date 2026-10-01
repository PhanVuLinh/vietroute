import { Injectable, NotFoundException, BadRequestException, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
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
  appliedUnit: string;
}

export interface HsCodeItem {
  hsCode: string;
  descriptionVi: string;
  descriptionEn: string;
  unit: string;
  standardDutyRate: number;
  mfnRate: number;
  evftaRate: number;
  cptppRate: number;
  acftaRate: number;
  atigaRate: number;
  vkftaRate: number;
  vatRate: number;
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
  profitMarginPercent: number;
  fxGainLossVnd: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
}

export interface ContainerDepositItem {
  id: string;
  containerNo: string;
  shipmentCode: string;
  carrier: string;
  depositAmountVnd: number;
  receiptNumber: string;
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
  overallRiskScore: number;
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
  private readonly logger = new Logger(InternationalService.name);

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    await this.seedInitialDataIfEmpty();
  }

  // ================= CONVERTER HELPERS =================
  private mapShipment(r: any): InternationalShipment {
    return {
      id: r.id,
      shipmentCode: r.shipment_code,
      direction: r.direction as any,
      transportMode: r.transport_mode as any,
      incoterm: r.incoterm as any,
      carrierName: r.carrier_name,
      vesselFlightNo: r.vessel_flight_no,
      polPort: r.pol_port,
      podPort: r.pod_port,
      etdDate: r.etd_date instanceof Date ? r.etd_date.toISOString() : String(r.etd_date),
      etaDate: r.eta_date instanceof Date ? r.eta_date.toISOString() : String(r.eta_date),
      blAwbNumber: r.bl_awb_number,
      containerNumber: r.container_number || undefined,
      sealNumber: r.seal_number || undefined,
      containerType: r.container_type || undefined,
      grossWeightKg: r.gross_weight_kg,
      cbmVolume: r.cbm_volume,
      packageCount: r.package_count,
      shipperName: r.shipper_name,
      consigneeName: r.consignee_name,
      currency: r.currency,
      freightAmount: r.freight_amount,
      customsStatus: r.customs_status as any,
      status: r.status as any,
      notes: r.notes || undefined,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  private mapCustoms(r: any): CustomsDeclaration {
    return {
      id: r.id,
      declarationNo: r.declaration_no,
      shipmentId: r.shipment_id,
      shipmentCode: r.shipment_code,
      customsBranch: r.customs_branch,
      declarationType: r.declaration_type,
      channel: r.channel as any,
      hsCode: r.hs_code,
      commodityDescription: r.commodity_description,
      invoiceValue: r.invoice_value,
      currency: r.currency,
      importTaxAmount: r.import_tax_amount,
      vatTaxAmount: r.vat_tax_amount,
      status: r.status as any,
      registeredDate: r.registered_date instanceof Date ? r.registered_date.toISOString() : String(r.registered_date),
      clearedDate: r.cleared_date ? (r.cleared_date instanceof Date ? r.cleared_date.toISOString() : String(r.cleared_date)) : undefined,
    };
  }

  private mapContainer(r: any): ContainerTrackingItem {
    return {
      id: r.id,
      containerNo: r.container_no,
      type: r.type as any,
      carrier: r.carrier,
      shipmentCode: r.shipment_code,
      sealNo: r.seal_no,
      currentLocation: r.current_location,
      temperatureRequired: r.temperature_required || undefined,
      demDetFreeDays: r.dem_det_free_days,
      gateInDate: r.gate_in_date instanceof Date ? r.gate_in_date.toISOString() : String(r.gate_in_date),
      freeTimeExpiryDate: r.free_time_expiry_date instanceof Date ? r.free_time_expiry_date.toISOString() : String(r.free_time_expiry_date),
      overdueDays: r.overdue_days,
      estimatedPenaltyAmountVnd: r.estimated_penalty_amount_vnd,
      status: r.status as any,
    };
  }

  private mapPort(r: any): InternationalPort {
    return {
      code: r.code,
      name: r.name,
      country: r.country,
      city: r.city,
      type: r.type as any,
    };
  }

  private mapExchangeRate(r: any): ExchangeRateItem {
    return {
      currency: r.currency,
      name: r.name,
      buyRateVnd: r.buy_rate_vnd,
      transferRateVnd: r.transfer_rate_vnd,
      sellRateVnd: r.sell_rate_vnd,
      updatedAt: r.updated_at instanceof Date ? r.updated_at.toISOString() : String(r.updated_at),
    };
  }

  private mapLocalCharge(r: any): LocalChargeItem {
    return {
      code: r.code,
      name: r.name,
      description: r.description,
      amount: r.amount,
      currency: r.currency,
      appliedUnit: r.applied_unit,
    };
  }

  private mapHsCode(r: any): HsCodeItem {
    return {
      hsCode: r.hs_code,
      descriptionVi: r.description_vi,
      descriptionEn: r.description_en,
      unit: r.unit,
      standardDutyRate: r.standard_duty_rate,
      mfnRate: r.mfn_rate,
      evftaRate: r.evfta_rate,
      cptppRate: r.cptpp_rate,
      acftaRate: r.acfta_rate,
      atigaRate: r.atiga_rate,
      vkftaRate: r.vkfta_rate,
      vatRate: r.vat_rate,
      specializedInspection: r.specialized_inspection || '',
      inspectionAgency: r.inspection_agency || undefined,
      importConditions: r.import_conditions || undefined,
    };
  }

  private mapFinancial(r: any): ShipmentFinancialPnl {
    return {
      shipmentId: r.shipment_id,
      shipmentCode: r.shipment_code,
      shipperName: r.shipper_name,
      carrierName: r.carrier_name,
      currency: r.currency,
      sellingFreight: r.selling_freight,
      sellingLocalCharges: r.selling_local_charges,
      totalRevenueVnd: r.total_revenue_vnd,
      buyingFreight: r.buying_freight,
      buyingLocalCharges: r.buying_local_charges,
      truckingCostVnd: r.trucking_cost_vnd,
      customsCostVnd: r.customs_cost_vnd,
      portHandlingCostVnd: r.port_handling_cost_vnd,
      totalCostVnd: r.total_cost_vnd,
      grossProfitVnd: r.gross_profit_vnd,
      grossProfitUsd: r.gross_profit_usd,
      profitMarginPercent: r.profit_margin_percent,
      fxGainLossVnd: r.fx_gain_loss_vnd,
      paymentStatus: r.payment_status as any,
    };
  }

  private mapDeposit(r: any): ContainerDepositItem {
    return {
      id: r.id,
      containerNo: r.container_no,
      shipmentCode: r.shipment_code,
      carrier: r.carrier,
      depositAmountVnd: r.deposit_amount_vnd,
      receiptNumber: r.receipt_number,
      depositedDate: r.deposited_date instanceof Date ? r.deposited_date.toISOString() : String(r.deposited_date),
      refundDueDate: r.refund_due_date instanceof Date ? r.refund_due_date.toISOString() : String(r.refund_due_date),
      refundStatus: r.refund_status as any,
      refundedAmountVnd: r.refunded_amount_vnd ?? undefined,
      deductedReason: r.deducted_reason ?? undefined,
      eirCondition: r.eir_condition as any,
    };
  }

  private mapVessel(r: any): VesselAisTrackingItem {
    return {
      vesselName: r.vessel_name,
      mmsi: r.mmsi,
      imo: r.imo,
      flag: r.flag,
      shipmentCodes: r.shipment_codes || [],
      currentLatitude: r.current_latitude,
      currentLongitude: r.current_longitude,
      speedKnots: r.speed_knots,
      headingDegrees: r.heading_degrees,
      departurePort: r.departure_port,
      destinationPort: r.destination_port,
      atdDate: r.atd_date instanceof Date ? r.atd_date.toISOString() : String(r.atd_date),
      etaPredicted: r.eta_predicted instanceof Date ? r.eta_predicted.toISOString() : String(r.eta_predicted),
      distanceCoveredNm: r.distance_covered_nm,
      distanceRemainingNm: r.distance_remaining_nm,
      progressPercent: r.progress_percent,
      weatherRisk: r.weather_risk as any,
      navStatus: r.nav_status as any,
    };
  }

  private mapShippingDocument(r: any): ShippingDocument {
    return {
      id: r.id,
      shipmentId: r.shipment_id,
      shipmentCode: r.shipment_code,
      documentType: r.document_type as any,
      documentNumber: r.document_number,
      issueDate: r.issue_date instanceof Date ? r.issue_date.toISOString() : String(r.issue_date),
      issuer: r.issuer,
      fileFormat: r.file_format,
      status: r.status as any,
      verificationNotes: r.verification_notes || undefined,
      isMandatory: r.is_mandatory,
    };
  }

  private mapDrayage(r: any): ContainerDrayageDispatchItem {
    return {
      id: r.id,
      dispatchCode: r.dispatch_code,
      shipmentCode: r.shipment_code,
      containerNo: r.container_no,
      containerType: r.container_type,
      dispatchType: r.dispatch_type as any,
      pickupLocation: r.pickup_location,
      deliveryLocation: r.delivery_location,
      tractorPlate: r.tractor_plate,
      trailerPlate: r.trailer_plate,
      driverName: r.driver_name,
      driverPhone: r.driver_phone,
      driverLicenseGrade: r.driver_license_grade as any,
      appointmentTime: r.appointment_time instanceof Date ? r.appointment_time.toISOString() : String(r.appointment_time),
      status: r.status as any,
      tollFeeVnd: r.toll_fee_vnd,
      fuelEstimatedLiters: r.fuel_estimated_liters,
      notes: r.notes || undefined,
      createdAt: r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at),
    };
  }

  // ================= SEED INITIAL DATA =================
  private async seedInitialDataIfEmpty() {
    try {
      const portCount = await this.prisma.internationalPort.count();
      if (portCount === 0) {
        this.logger.log('Seeding initial international ports into PostgreSQL...');
        const initialPorts = [
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
        await this.prisma.internationalPort.createMany({ data: initialPorts, skipDuplicates: true });
      }

      const rateCount = await this.prisma.exchangeRate.count();
      if (rateCount === 0) {
        this.logger.log('Seeding initial exchange rates into PostgreSQL...');
        const initialRates = [
          { currency: 'USD', name: 'Đô la Mỹ', buy_rate_vnd: 25420, transfer_rate_vnd: 25450, sell_rate_vnd: 25780 },
          { currency: 'EUR', name: 'Đồng Euro', buy_rate_vnd: 27580, transfer_rate_vnd: 27650, sell_rate_vnd: 28100 },
          { currency: 'CNY', name: 'Nhân dân tệ Trung Quốc', buy_rate_vnd: 3510, transfer_rate_vnd: 3530, sell_rate_vnd: 3620 },
          { currency: 'JPY', name: 'Yên Nhật', buy_rate_vnd: 165.2, transfer_rate_vnd: 166.5, sell_rate_vnd: 171.8 },
          { currency: 'SGD', name: 'Đô la Singapore', buy_rate_vnd: 19150, transfer_rate_vnd: 19220, sell_rate_vnd: 19600 },
        ];
        await this.prisma.exchangeRate.createMany({ data: initialRates, skipDuplicates: true });
      }

      const chargeCount = await this.prisma.localCharge.count();
      if (chargeCount === 0) {
        this.logger.log('Seeding initial local charges into PostgreSQL...');
        const initialCharges = [
          { code: 'THC', name: 'Terminal Handling Charge', description: 'Phí bốc xếp container từ cầu tàu lên bãi cảng', amount: 155, currency: 'USD', applied_unit: 'Per 40HC' },
          { code: 'D/O', name: 'Delivery Order Fee', description: 'Phí phát hành lệnh giao hàng cho chủ hàng nhập khẩu', amount: 45, currency: 'USD', applied_unit: 'Per Bill' },
          { code: 'CFS', name: 'Container Freight Station', description: 'Phí bốc dỡ và lưu kho cho hàng lẻ đóng ghép LCL', amount: 18, currency: 'USD', applied_unit: 'Per CBM' },
          { code: 'CIC', name: 'Container Imbalance Charge', description: 'Phí phụ trội bù đắp chi phí điều chuyển vỏ rỗng', amount: 80, currency: 'USD', applied_unit: 'Per Container' },
          { code: 'SEAL', name: 'Seal Fee', description: 'Phí kẹp chì niêm phong bảo mật hải quan', amount: 10, currency: 'USD', applied_unit: 'Per Seal' },
          { code: 'AMS', name: 'Automated Manifest System', description: 'Phí truyền dữ liệu tờ khai an ninh điện tử vào hải quan Hoa Kỳ', amount: 35, currency: 'USD', applied_unit: 'Per Bill' },
        ];
        await this.prisma.localCharge.createMany({ data: initialCharges, skipDuplicates: true });
      }

      const hsCount = await this.prisma.hsCode.count();
      if (hsCount === 0) {
        this.logger.log('Seeding initial HS Codes into PostgreSQL...');
        const initialHsCodes = [
          {
            hs_code: '0306.17.21',
            description_vi: 'Tôm thẻ chân trắng đông lạnh (Penaeus vannamei), bóc vỏ, bỏ đầu',
            description_en: 'Frozen whiteleg shrimp, peeled, headless',
            unit: 'KG',
            standard_duty_rate: 15,
            mfn_rate: 10,
            evfta_rate: 0,
            cptpp_rate: 0,
            acfta_rate: 0,
            atiga_rate: 0,
            vkfta_rate: 0,
            vat_rate: 0,
            specialized_inspection: 'Bắt buộc Kiểm dịch động vật thủy sản nhập khẩu',
            inspection_agency: 'Cục Thú Y (Bộ NN&PTNT)',
            import_conditions: 'Cần có Health Certificate từ cơ quan thẩm quyền nước xuất khẩu',
          },
          {
            hs_code: '0901.11.10',
            description_vi: 'Cà phê Robusta nhân sống, chưa rang, chưa khử chất caffeine',
            description_en: 'Coffee, not roasted, not decaffeinated, Robusta',
            unit: 'KG',
            standard_duty_rate: 30,
            mfn_rate: 20,
            evfta_rate: 0,
            cptpp_rate: 0,
            acfta_rate: 5,
            atiga_rate: 0,
            vkfta_rate: 0,
            vat_rate: 5,
            specialized_inspection: 'Kiểm dịch thực vật tại cửa khẩu',
            inspection_agency: 'Cục Bảo vệ Thực vật',
            import_conditions: 'Chứng thư kiểm dịch Phytosanitary',
          },
          {
            hs_code: '6109.10.10',
            description_vi: 'Áo phông (T-shirts) dệt kim hoặc móc, bằng bông (cotton 100%)',
            description_en: 'T-shirts, knitted or crocheted, of cotton',
            unit: 'PCE',
            standard_duty_rate: 30,
            mfn_rate: 20,
            evfta_rate: 2,
            cptpp_rate: 0,
            acfta_rate: 0,
            atiga_rate: 0,
            vkfta_rate: 5,
            vat_rate: 8,
            specialized_inspection: 'Kiểm tra dư lượng Formaldehyt và Amin thơm chuyển hóa',
            inspection_agency: 'Viện Dệt May / Trung tâm Giám định',
            import_conditions: 'Quy chuẩn kỹ thuật quốc gia QCVN 01:2017/BCT',
          },
          {
            hs_code: '8541.43.00',
            description_vi: 'Tấm pin năng lượng mặt trời (Solar photovoltaic modules)',
            description_en: 'Photovoltaic cells assembled in modules or made up into panels',
            unit: 'PCE',
            standard_duty_rate: 5,
            mfn_rate: 0,
            evfta_rate: 0,
            cptpp_rate: 0,
            acfta_rate: 0,
            atiga_rate: 0,
            vkfta_rate: 0,
            vat_rate: 8,
            specialized_inspection: 'Kiểm tra hiệu suất năng lượng tối thiểu & an toàn điện',
            inspection_agency: 'Bộ Công Thương',
            import_conditions: 'Chứng nhận hợp quy dán nhãn năng lượng',
          },
          {
            hs_code: '4011.20.10',
            description_vi: 'Lốp xe tải loại bơm hơi bằng cao su, kết cấu bố tròn (Radial)',
            description_en: 'New pneumatic tyres, of rubber, of a kind used on buses or lorries (Radial)',
            unit: 'PCE',
            standard_duty_rate: 35,
            mfn_rate: 25,
            evfta_rate: 5,
            cptpp_rate: 0,
            acfta_rate: 0,
            atiga_rate: 0,
            vkfta_rate: 5,
            vat_rate: 8,
            specialized_inspection: 'Kiểm tra chất lượng nhà nước an toàn kỹ thuật linh kiện ô tô',
            inspection_agency: 'Cục Đăng Kiểm Việt Nam (Bộ GTVT)',
            import_conditions: 'Giấy chứng nhận thử nghiệm mẫu theo QCVN 34:2017/BGTVT',
          },
          {
            hs_code: '8471.30.20',
            description_vi: 'Máy vi tính xách tay (Laptop), bao gồm cả notebook và subnotebook',
            description_en: 'Laptops, portable automatic data processing machines',
            unit: 'PCE',
            standard_duty_rate: 0,
            mfn_rate: 0,
            evfta_rate: 0,
            cptpp_rate: 0,
            acfta_rate: 0,
            atiga_rate: 0,
            vkfta_rate: 0,
            vat_rate: 8,
            specialized_inspection: 'Kiểm tra chất lượng hợp quy thiết bị viễn thông và CNTT',
            inspection_agency: 'Bộ Thông tin và Truyền thông (Cục Viễn Thông)',
            import_conditions: 'Giấy chứng nhận hợp quy (CR) và dấu hợp quy',
          },
        ];
        await this.prisma.hsCode.createMany({ data: initialHsCodes, skipDuplicates: true });
      }

      const shipmentCount = await this.prisma.internationalShipment.count();
      if (shipmentCount === 0) {
        this.logger.log('Seeding initial international shipments into PostgreSQL...');
        const initialShipments = [
          {
            id: 'shp-exp-001',
            shipment_code: 'EXP-2026-001',
            direction: 'EXPORT' as any,
            transport_mode: 'OCEAN_FCL' as any,
            incoterm: 'FOB',
            carrier_name: 'Maersk Line',
            vessel_flight_no: 'MAERSK MC-KINNEY 2601E',
            pol_port: 'VNSGN - Cảng Tân Cảng Cát Lái',
            pod_port: 'USLAX - Port of Los Angeles',
            etd_date: new Date('2026-09-28T14:00:00.000Z'),
            eta_date: new Date('2026-10-18T08:00:00.000Z'),
            bl_awb_number: 'MAEU982180421',
            container_number: 'MSKU8841920',
            seal_number: 'ML-VN98412',
            container_type: '40HC',
            gross_weight_kg: 24500,
            cbm_volume: 68.5,
            package_count: 950,
            shipper_name: 'Tập Đoàn May Mặc Xuất Khẩu Việt Tiến',
            consignee_name: 'Walmart Global Sourcing (USA)',
            currency: 'USD',
            freight_amount: 3850,
            customs_status: 'CLEARED',
            status: 'CUSTOMS_CLEARED',
            notes: 'Hàng may mặc đi Mỹ, đã kiểm tra hun trùng và kẹp chì điện tử.',
          },
          {
            id: 'shp-imp-002',
            shipment_code: 'IMP-2026-002',
            direction: 'IMPORT' as any,
            transport_mode: 'OCEAN_FCL' as any,
            incoterm: 'CIF',
            carrier_name: 'COSCO Shipping Lines',
            vessel_flight_no: 'COSCO HELLAS 045W',
            pol_port: 'CNSHA - Port of Shanghai',
            pod_port: 'VNHPH - Cảng Hải Phòng',
            etd_date: new Date('2026-09-22T08:00:00.000Z'),
            eta_date: new Date('2026-09-29T16:00:00.000Z'),
            bl_awb_number: 'COSU632194012',
            container_number: 'TCLU1284711',
            seal_number: 'CS-SH28192',
            container_type: '20GP',
            gross_weight_kg: 16800,
            cbm_volume: 28.2,
            package_count: 420,
            shipper_name: 'Semiconductor Precision Ltd (Shanghai)',
            consignee_name: 'Công ty Cổ phần Công nghệ FPT / Viettel',
            currency: 'USD',
            freight_amount: 850,
            customs_status: 'YELLOW',
            status: 'CUSTOMS_PROCESSING',
            notes: 'Linh kiện chip điện tử bán dẫn, hải quan yêu cầu bổ sung C/O Form E.',
          },
          {
            id: 'shp-air-003',
            shipment_code: 'AIR-2026-003',
            direction: 'EXPORT' as any,
            transport_mode: 'AIR_FREIGHT' as any,
            incoterm: 'DDP',
            carrier_name: 'Qatar Airways Cargo',
            vessel_flight_no: 'QR 8842 Boeing 777F',
            pol_port: 'HAN - Sân bay Quốc tế Nội Bài Cargo',
            pod_port: 'FRA - Frankfurt Airport Cargo Terminal',
            etd_date: new Date('2026-09-28T22:30:00.000Z'),
            eta_date: new Date('2026-09-29T14:45:00.000Z'),
            bl_awb_number: '157-89410294',
            container_type: 'ULD Air Pallet',
            gross_weight_kg: 620,
            cbm_volume: 3.8,
            package_count: 35,
            shipper_name: 'Samsung Electronics Vietnam (SEV)',
            consignee_name: 'Samsung Electronics Europe Logistics B.V.',
            currency: 'EUR',
            freight_amount: 2650,
            customs_status: 'GREEN',
            status: 'BOOKING_CONFIRMED',
            notes: 'Lô hàng mẫu bo mạch điện thoại flagship phục vụ ra mắt thị trường EU.',
          },
          {
            id: 'shp-crb-004',
            shipment_code: 'CRB-2026-004',
            direction: 'CROSS_BORDER' as any,
            transport_mode: 'ROAD_CROSS_BORDER' as any,
            incoterm: 'DAP',
            carrier_name: 'VietRoute Cross-Border Logistics Fleet',
            vessel_flight_no: 'Xe liên vận VN-CN: 29H-882.19 / Rơ-mooc 29R-012.88',
            pol_port: 'VNHNI - Cửa khẩu Quốc tế Hữu Nghị',
            pod_port: 'Trung Quốc - Chợ Nông Sản Nam Ninh',
            etd_date: new Date('2026-09-27T18:00:00.000Z'),
            eta_date: new Date('2026-09-28T12:00:00.000Z'),
            bl_awb_number: 'VTR-CRB-2026-004',
            container_number: 'CMAU9921448',
            seal_number: 'HQ-HN-44129',
            container_type: '40RF',
            gross_weight_kg: 22000,
            cbm_volume: 65.0,
            package_count: 1800,
            shipper_name: 'Hợp Tác Xã Nông Sản Sầu Riêng Tiền Giang',
            consignee_name: 'Guangxi Fresh Fruits Trading Co., Ltd',
            currency: 'CNY',
            freight_amount: 18500,
            customs_status: 'CLEARED',
            status: 'SAILING',
            notes: 'Container lạnh duy trì nhiệt độ +14°C, có chứng thư kiểm dịch thực vật.',
          },
          {
            id: 'shp-imp-005',
            shipment_code: 'IMP-2026-005',
            direction: 'IMPORT' as any,
            transport_mode: 'OCEAN_FCL' as any,
            incoterm: 'EXW',
            carrier_name: 'Hapag-Lloyd',
            vessel_flight_no: 'AL MURABBA 022E',
            pol_port: 'DEHAM - Port of Hamburg',
            pod_port: 'VNSGN - Cảng Tân Cảng Cát Lái',
            etd_date: new Date('2026-09-02T10:00:00.000Z'),
            eta_date: new Date('2026-09-27T20:00:00.000Z'),
            bl_awb_number: 'HLCUHAM2608192',
            container_number: 'HLXU4819201',
            seal_number: 'HL-DE99120',
            container_type: '40HC',
            gross_weight_kg: 21800,
            cbm_volume: 58.0,
            package_count: 12,
            shipper_name: 'Siemens Industrial Automation GmbH',
            consignee_name: 'VinFast Auto Manufacturing Complex',
            currency: 'EUR',
            freight_amount: 3400,
            customs_status: 'RED',
            status: 'ARRIVED_PORT',
            notes: 'Dây chuyền dập robot công nghiệp, phân luồng Đỏ kiểm hóa thực tế tại Cát Lái.',
          },
        ];
        await this.prisma.internationalShipment.createMany({ data: initialShipments, skipDuplicates: true });
      }

      const customsCount = await this.prisma.customsDeclaration.count();
      if (customsCount === 0) {
        this.logger.log('Seeding initial customs declarations into PostgreSQL...');
        const initialCustoms = [
          {
            id: 'cst-001',
            declaration_no: '104829104820',
            shipment_id: 'shp-exp-001',
            shipment_code: 'EXP-2026-001',
            customs_branch: 'Chi cục HQ CK Cảng Sài Gòn KV1 (Cát Lái)',
            declaration_type: 'B11 (Xuất kinh doanh)',
            channel: 'GREEN' as any,
            hs_code: '6109.10.00',
            commodity_description: 'Áo thun cotton dệt kim nam xuất khẩu',
            invoice_value: 145000,
            currency: 'USD',
            import_tax_amount: 0,
            vat_tax_amount: 0,
            status: 'CLEARED',
            registered_date: new Date('2026-09-26T08:30:00.000Z'),
            cleared_date: new Date('2026-09-26T08:45:00.000Z'),
          },
          {
            id: 'cst-002',
            declaration_no: '104829881923',
            shipment_id: 'shp-imp-002',
            shipment_code: 'IMP-2026-002',
            customs_branch: 'Chi cục Hải quan CK Cảng Đình Vũ - Hải Phòng',
            declaration_type: 'A11 (Nhập kinh doanh tiêu dùng)',
            channel: 'YELLOW' as any,
            hs_code: '8542.31.00',
            commodity_description: 'Bộ vi xử lý tích hợp (IC Chipset điều khiển)',
            invoice_value: 88500,
            currency: 'USD',
            import_tax_amount: 0,
            vat_tax_amount: 225675000,
            status: 'REGISTERED',
            registered_date: new Date('2026-09-27T09:15:00.000Z'),
          },
          {
            id: 'cst-003',
            declaration_no: '104830119284',
            shipment_id: 'shp-air-003',
            shipment_code: 'AIR-2026-003',
            customs_branch: 'Chi cục HQ CK Sân bay Quốc tế Nội Bài',
            declaration_type: 'E31 (Nhập / Xuất sản xuất gia công)',
            channel: 'GREEN' as any,
            hs_code: '8517.70.10',
            commodity_description: 'Bo mạch PBA hoàn chỉnh cho smartphone',
            invoice_value: 320000,
            currency: 'EUR',
            import_tax_amount: 0,
            vat_tax_amount: 0,
            status: 'CLEARED',
            registered_date: new Date('2026-09-27T08:00:00.000Z'),
            cleared_date: new Date('2026-09-27T08:10:00.000Z'),
          },
          {
            id: 'cst-004',
            declaration_no: '104830554190',
            shipment_id: 'shp-imp-005',
            shipment_code: 'IMP-2026-005',
            customs_branch: 'Chi cục HQ CK Cảng Sài Gòn KV1 (Cát Lái)',
            declaration_type: 'A12 (Nhập kinh doanh sản xuất máy móc thiết bị)',
            channel: 'RED' as any,
            hs_code: '8479.89.40',
            commodity_description: 'Cánh tay robot công nghiệp dập tự động 6 bậc tự do',
            invoice_value: 420000,
            currency: 'EUR',
            import_tax_amount: 0,
            vat_tax_amount: 1159200000,
            status: 'REGISTERED',
            registered_date: new Date('2026-09-27T10:00:00.000Z'),
          },
        ];
        await this.prisma.customsDeclaration.createMany({ data: initialCustoms, skipDuplicates: true });
      }

      const containerCount = await this.prisma.containerTracking.count();
      if (containerCount === 0) {
        this.logger.log('Seeding initial container trackings into PostgreSQL...');
        const initialContainers = [
          {
            id: 'cnt-01',
            container_no: 'MSKU8841920',
            type: '40HC',
            carrier: 'Maersk Line',
            shipment_code: 'EXP-2026-001',
            seal_no: 'ML-VN98412',
            current_location: 'Bãi Cảng Cát Lái - Block E3',
            dem_det_free_days: 7,
            gate_in_date: new Date('2026-09-26T15:00:00.000Z'),
            free_time_expiry_date: new Date('2026-10-03T23:59:59.000Z'),
            overdue_days: 0,
            estimated_penalty_amount_vnd: 0,
            status: 'IN_DEPOT',
          },
          {
            id: 'cnt-02',
            container_no: 'TCLU1284711',
            type: '20GP',
            carrier: 'COSCO Shipping',
            shipment_code: 'IMP-2026-002',
            seal_no: 'CS-SH28192',
            current_location: 'Tàu COSCO HELLAS (Biển Đông)',
            dem_det_free_days: 14,
            gate_in_date: new Date('2026-09-22T08:00:00.000Z'),
            free_time_expiry_date: new Date('2026-10-06T23:59:59.000Z'),
            overdue_days: 0,
            estimated_penalty_amount_vnd: 0,
            status: 'ON_VESSEL',
          },
          {
            id: 'cnt-03',
            container_no: 'HLXU4819201',
            type: '40HC',
            carrier: 'Hapag-Lloyd',
            shipment_code: 'IMP-2026-005',
            seal_no: 'HL-DE99120',
            current_location: 'Bãi Kiểm Hóa Hải Quan Cát Lái (Khu C)',
            dem_det_free_days: 5,
            gate_in_date: new Date('2026-09-21T09:00:00.000Z'),
            free_time_expiry_date: new Date('2026-09-26T23:59:59.000Z'),
            overdue_days: 1,
            estimated_penalty_amount_vnd: 1250000,
            status: 'IN_DEPOT',
          },
          {
            id: 'cnt-04',
            container_no: 'CMAU9921448',
            type: '40RF',
            carrier: 'VietRoute Fleet',
            shipment_code: 'CRB-2026-004',
            seal_no: 'HQ-HN-44129',
            current_location: 'Đang di chuyển trên Quốc lộ 1A qua Bắc Giang',
            temperature_required: '+14°C',
            dem_det_free_days: 7,
            gate_in_date: new Date('2026-09-25T11:00:00.000Z'),
            free_time_expiry_date: new Date('2026-10-02T23:59:59.000Z'),
            overdue_days: 0,
            estimated_penalty_amount_vnd: 0,
            status: 'AT_FACTORY',
          },
        ];
        await this.prisma.containerTracking.createMany({ data: initialContainers, skipDuplicates: true });
      }

      const financialCount = await this.prisma.shipmentFinancial.count();
      if (financialCount === 0) {
        this.logger.log('Seeding initial shipment financials into PostgreSQL...');
        const initialFinancials = [
          {
            shipment_id: 'shp-01',
            shipment_code: 'EXP-2026-001',
            shipper_name: 'Tập đoàn Dệt may Việt Nam (Vinatex)',
            carrier_name: 'Maersk Line',
            currency: 'USD',
            selling_freight: 2200,
            selling_local_charges: 350,
            total_revenue_vnd: 65161000,
            buying_freight: 1750,
            buying_local_charges: 260,
            trucking_cost_vnd: 4500000,
            customs_cost_vnd: 1200000,
            port_handling_cost_vnd: 1500000,
            total_cost_vnd: 58454500,
            gross_profit_vnd: 6706500,
            gross_profit_usd: 263.5,
            profit_margin_percent: 10.29,
            fx_gain_loss_vnd: 450000,
            payment_status: 'PAID',
          },
          {
            shipment_id: 'shp-02',
            shipment_code: 'IMP-2026-002',
            shipper_name: 'Semiconductor Precision Ltd',
            carrier_name: 'COSCO Shipping',
            currency: 'USD',
            selling_freight: 1850,
            selling_local_charges: 180,
            total_revenue_vnd: 51866700,
            buying_freight: 1300,
            buying_local_charges: 120,
            trucking_cost_vnd: 4200000,
            customs_cost_vnd: 950000,
            port_handling_cost_vnd: 800000,
            total_cost_vnd: 42139000,
            gross_profit_vnd: 9727700,
            gross_profit_usd: 382.2,
            profit_margin_percent: 18.75,
            fx_gain_loss_vnd: 180000,
            payment_status: 'PAID',
          },
        ];
        await this.prisma.shipmentFinancial.createMany({ data: initialFinancials, skipDuplicates: true });
      }

      const depositCount = await this.prisma.containerDeposit.count();
      if (depositCount === 0) {
        this.logger.log('Seeding initial container deposits into PostgreSQL...');
        const initialDeposits = [
          {
            id: 'dep-01',
            container_no: 'MSKU8923410',
            shipment_code: 'EXP-2026-001',
            carrier: 'Maersk Line',
            deposit_amount_vnd: 3000000,
            receipt_number: 'EIR-MSK-2026-8812',
            deposited_date: new Date('2026-09-24T08:30:00.000Z'),
            refund_due_date: new Date('2026-10-10T17:00:00.000Z'),
            refund_status: 'PENDING_REFUND',
            eir_condition: 'INTACT',
          },
          {
            id: 'dep-02',
            container_no: 'HLXU4819201',
            shipment_code: 'IMP-2026-005',
            carrier: 'Hapag-Lloyd',
            deposit_amount_vnd: 3500000,
            receipt_number: 'EIR-HL-2026-9021',
            deposited_date: new Date('2026-09-21T10:00:00.000Z'),
            refund_due_date: new Date('2026-09-28T17:00:00.000Z'),
            refund_status: 'DEDUCTED_REPAIR',
            refunded_amount_vnd: 2800000,
            deducted_reason: 'Phát sinh vết móp sàn gỗ container (trừ 700.000 VNĐ theo biên bản EIR)',
            eir_condition: 'DENTED',
          },
        ];
        await this.prisma.containerDeposit.createMany({ data: initialDeposits, skipDuplicates: true });
      }

      const vesselCount = await this.prisma.vesselAisTracking.count();
      if (vesselCount === 0) {
        this.logger.log('Seeding initial vessel tracking into PostgreSQL...');
        const initialVessels = [
          {
            vessel_name: 'MAERSK MC-KINNEY MOLLER',
            mmsi: '219018271',
            imo: '9619907',
            flag: 'Denmark',
            shipment_codes: ['EXP-2026-001'],
            current_latitude: 14.8512,
            current_longitude: 114.2831,
            speed_knots: 19.4,
            heading_degrees: 68,
            departure_port: 'VNSGN - Tân Cảng Cát Lái',
            destination_port: 'USLAX - Port of Los Angeles',
            atd_date: new Date('2026-09-26T16:00:00.000Z'),
            eta_predicted: new Date('2026-10-12T08:00:00.000Z'),
            distance_covered_nm: 1240,
            distance_remaining_nm: 6820,
            progress_percent: 15.38,
            weather_risk: 'LOW_NORMAL',
            nav_status: 'UNDERWAY_USING_ENGINE',
          },
          {
            vessel_name: 'ONE APUS',
            mmsi: '353136000',
            imo: '9806079',
            flag: 'Japan',
            shipment_codes: ['EXP-2026-003'],
            current_latitude: 10.3541,
            current_longitude: 107.0189,
            speed_knots: 0.1,
            heading_degrees: 182,
            departure_port: 'VNSGN - Tân Cảng Cái Mép (TCIT)',
            destination_port: 'DEHAM - Port of Hamburg',
            atd_date: new Date('2026-09-28T02:00:00.000Z'),
            eta_predicted: new Date('2026-10-22T14:00:00.000Z'),
            distance_covered_nm: 0,
            distance_remaining_nm: 9200,
            progress_percent: 0,
            weather_risk: 'LOW_NORMAL',
            nav_status: 'MOORED',
          },
        ];
        await this.prisma.vesselAisTracking.createMany({ data: initialVessels, skipDuplicates: true });
      }

      const docCount = await this.prisma.shippingDocumentRecord.count();
      if (docCount === 0) {
        this.logger.log('Seeding initial shipping documents into PostgreSQL...');
        const initialDocs = [
          {
            id: 'doc-01',
            shipment_id: 'shp-exp-001',
            shipment_code: 'EXP-2026-001',
            document_type: 'BILL_OF_LADING',
            document_number: 'MAEU-B/L-982180421',
            issue_date: new Date('2026-09-27T10:00:00.000Z'),
            issuer: 'Maersk Line A/S Vietnam Branch',
            file_format: 'PDF',
            status: 'VERIFIED',
            verification_notes: 'Vận đơn điện tử Seaway Bill, đã đối chiếu đầy đủ với Shipper & Consignee',
            is_mandatory: true,
          },
          {
            id: 'doc-02',
            shipment_id: 'shp-exp-001',
            shipment_code: 'EXP-2026-001',
            document_type: 'COMMERCIAL_INVOICE',
            document_number: 'INV-VT-2026-8812',
            issue_date: new Date('2026-09-26T14:30:00.000Z'),
            issuer: 'Tập Đoàn May Mặc Việt Tiến',
            file_format: 'PDF',
            status: 'VERIFIED',
            verification_notes: 'Khớp với giá trị khai báo hải quan 145.000 USD',
            is_mandatory: true,
          },
        ];
        await this.prisma.shippingDocumentRecord.createMany({ data: initialDocs, skipDuplicates: true });
      }

      const drayageCount = await this.prisma.containerDrayageDispatch.count();
      if (drayageCount === 0) {
        this.logger.log('Seeding initial drayage dispatches into PostgreSQL...');
        const initialDrayages = [
          {
            id: 'dsp-01',
            dispatch_code: 'DO-TRUCK-2601',
            shipment_code: 'EXP-2026-001',
            container_no: 'MSKU8841920',
            container_type: '40HC',
            dispatch_type: 'DOOR_TO_PORT',
            pickup_location: 'Kho Vinatex - KCN Sóng Thần, Dĩ An, Bình Dương',
            delivery_location: 'Cảng Tân Cảng Cát Lái - Cổng E (Hạ bãi xuất khẩu)',
            tractor_plate: '51C-881.92',
            trailer_plate: '51R-441.20',
            driver_name: 'Nguyễn Văn Hùng',
            driver_phone: '0918.441.291',
            driver_license_grade: 'FC',
            appointment_time: new Date('2026-09-28T05:30:00.000Z'),
            status: 'DISPATCHED',
            toll_fee_vnd: 180000,
            fuel_estimated_liters: 48,
            notes: 'Đã hoàn tất đóng hàng niêm phong chì seal ML-VN98412',
          },
          {
            id: 'dsp-02',
            dispatch_code: 'DO-TRUCK-2602',
            shipment_code: 'IMP-2026-005',
            container_no: 'HLXU4819201',
            container_type: '40HC',
            dispatch_type: 'PORT_TO_DOOR',
            pickup_location: 'Bãi Cảng Cát Lái (Sau thông quan hải quan)',
            delivery_location: 'Nhà máy Sơn BASF - KCN Amata, Đồng Nai',
            tractor_plate: '60C-442.88',
            trailer_plate: '60R-221.75',
            driver_name: 'Lê Hoàng Nam',
            driver_phone: '0978.112.554',
            driver_license_grade: 'FC',
            appointment_time: new Date('2026-09-29T21:30:00.000Z'),
            status: 'PENDING_DISPATCH',
            toll_fee_vnd: 150000,
            fuel_estimated_liters: 42,
            notes: 'Chạy khung giờ đêm tránh giờ cấm tải xe container trên Xa lộ Hà Nội',
          },
        ];
        await this.prisma.containerDrayageDispatch.createMany({ data: initialDrayages, skipDuplicates: true });
      }
    } catch (err: any) {
      this.logger.warn(`Lỗi khi seed dữ liệu vận tải quốc tế: ${err?.message}`);
    }
  }

  // ================= SHIPMENTS API =================
  async getShipments(params?: {
    direction?: string;
    mode?: string;
    incoterm?: string;
    status?: string;
    search?: string;
  }): Promise<InternationalShipment[]> {
    const where: any = {};

    if (params?.direction && params.direction !== 'ALL') {
      where.direction = params.direction;
    }
    if (params?.mode && params.mode !== 'ALL') {
      where.transport_mode = params.mode;
    }
    if (params?.incoterm && params.incoterm !== 'ALL') {
      where.incoterm = params.incoterm;
    }
    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { shipment_code: { contains: q, mode: 'insensitive' } },
        { bl_awb_number: { contains: q, mode: 'insensitive' } },
        { container_number: { contains: q, mode: 'insensitive' } },
        { carrier_name: { contains: q, mode: 'insensitive' } },
        { shipper_name: { contains: q, mode: 'insensitive' } },
        { consignee_name: { contains: q, mode: 'insensitive' } },
        { pol_port: { contains: q, mode: 'insensitive' } },
        { pod_port: { contains: q, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.internationalShipment.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    return records.map((r) => this.mapShipment(r));
  }

  async getShipmentById(id: string): Promise<InternationalShipment> {
    const record = await this.prisma.internationalShipment.findFirst({
      where: {
        OR: [{ id }, { shipment_code: id }],
      },
    });

    if (!record) {
      throw new NotFoundException(`Không tìm thấy lô hàng quốc tế ${id}`);
    }
    return this.mapShipment(record);
  }

  async createShipment(dto: CreateInternationalShipmentDto): Promise<InternationalShipment> {
    const code = dto.shipmentCode.trim().toUpperCase();
    const existing = await this.prisma.internationalShipment.findUnique({
      where: { shipment_code: code },
    });

    if (existing) {
      throw new BadRequestException(`Mã lô hàng "${dto.shipmentCode}" đã tồn tại`);
    }

    const record = await this.prisma.internationalShipment.create({
      data: {
        shipment_code: code,
        direction: (dto.direction as any) || 'EXPORT',
        transport_mode: (dto.transportMode as any) || 'OCEAN_FCL',
        incoterm: dto.incoterm || 'FOB',
        carrier_name: dto.carrierName.trim(),
        vessel_flight_no: dto.vesselFlightNo?.trim() || 'Chưa xếp tàu/chuyến',
        pol_port: dto.polPort,
        pod_port: dto.podPort,
        etd_date: dto.etdDate ? new Date(dto.etdDate) : new Date(),
        eta_date: dto.etaDate ? new Date(dto.etaDate) : new Date(Date.now() + 14 * 86400000),
        bl_awb_number: dto.blAwbNumber?.trim() || `BL-${Date.now().toString().slice(-6)}`,
        container_number: dto.containerNumber?.trim(),
        seal_number: dto.sealNumber?.trim(),
        container_type: dto.containerType || '40HC',
        gross_weight_kg: dto.grossWeightKg || 1000,
        cbm_volume: dto.cbmVolume || 10,
        package_count: dto.packageCount || 50,
        shipper_name: dto.shipperName?.trim() || 'Shipper Quốc Tế',
        consignee_name: dto.consigneeName?.trim() || 'Consignee Nhập Khẩu',
        currency: dto.currency || 'USD',
        freight_amount: dto.freightAmount || 1500,
        customs_status: 'NOT_FILED',
        status: (dto.status as any) || 'BOOKING_CONFIRMED',
        notes: dto.notes,
      },
    });

    return this.mapShipment(record);
  }

  async updateShipment(id: string, dto: Partial<CreateInternationalShipmentDto>): Promise<InternationalShipment> {
    const existing = await this.prisma.internationalShipment.findFirst({
      where: { OR: [{ id }, { shipment_code: id }] },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy lô hàng ${id}`);
    }

    const data: any = {};
    if (dto.direction) data.direction = dto.direction;
    if (dto.transportMode) data.transport_mode = dto.transportMode;
    if (dto.incoterm) data.incoterm = dto.incoterm;
    if (dto.carrierName) data.carrier_name = dto.carrierName;
    if (dto.vesselFlightNo !== undefined) data.vessel_flight_no = dto.vesselFlightNo;
    if (dto.polPort) data.pol_port = dto.polPort;
    if (dto.podPort) data.pod_port = dto.podPort;
    if (dto.etdDate) data.etd_date = new Date(dto.etdDate);
    if (dto.etaDate) data.eta_date = new Date(dto.etaDate);
    if (dto.blAwbNumber) data.bl_awb_number = dto.blAwbNumber;
    if (dto.containerNumber !== undefined) data.container_number = dto.containerNumber;
    if (dto.sealNumber !== undefined) data.seal_number = dto.sealNumber;
    if (dto.containerType !== undefined) data.container_type = dto.containerType;
    if (dto.grossWeightKg !== undefined) data.gross_weight_kg = dto.grossWeightKg;
    if (dto.cbmVolume !== undefined) data.cbm_volume = dto.cbmVolume;
    if (dto.packageCount !== undefined) data.package_count = dto.packageCount;
    if (dto.shipperName) data.shipper_name = dto.shipperName;
    if (dto.consigneeName) data.consignee_name = dto.consigneeName;
    if (dto.currency) data.currency = dto.currency;
    if (dto.freightAmount !== undefined) data.freight_amount = dto.freightAmount;
    if (dto.status) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;

    const updated = await this.prisma.internationalShipment.update({
      where: { id: existing.id },
      data,
    });

    return this.mapShipment(updated);
  }

  async deleteShipment(id: string) {
    const existing = await this.prisma.internationalShipment.findFirst({
      where: { OR: [{ id }, { shipment_code: id }] },
    });

    if (!existing) {
      throw new NotFoundException(`Không tìm thấy lô hàng ${id}`);
    }

    await this.prisma.internationalShipment.delete({
      where: { id: existing.id },
    });

    return { success: true, message: `Đã xóa lô hàng ${existing.shipment_code}` };
  }

  // ================= CUSTOMS DECLARATIONS API =================
  async getCustomsDeclarations(params?: { channel?: string; status?: string; search?: string }): Promise<CustomsDeclaration[]> {
    const where: any = {};
    if (params?.channel && params.channel !== 'ALL') {
      where.channel = params.channel;
    }
    if (params?.status && params.status !== 'ALL') {
      where.status = params.status;
    }
    if (params?.search && params.search.trim()) {
      const q = params.search.trim();
      where.OR = [
        { declaration_no: { contains: q, mode: 'insensitive' } },
        { shipment_code: { contains: q, mode: 'insensitive' } },
        { customs_branch: { contains: q, mode: 'insensitive' } },
        { hs_code: { contains: q, mode: 'insensitive' } },
        { commodity_description: { contains: q, mode: 'insensitive' } },
      ];
    }

    const records = await this.prisma.customsDeclaration.findMany({
      where,
      orderBy: { registered_date: 'desc' },
    });

    return records.map((r) => this.mapCustoms(r));
  }

  async createCustomsDeclaration(dto: CreateCustomsDeclarationDto): Promise<CustomsDeclaration> {
    const declNo = dto.declarationNo.trim();
    const existing = await this.prisma.customsDeclaration.findUnique({
      where: { declaration_no: declNo },
    });

    if (existing) {
      throw new BadRequestException(`Số tờ khai hải quan "${declNo}" đã tồn tại`);
    }

    let shipmentCode = dto.shipmentId;
    const shipment = await this.prisma.internationalShipment.findFirst({
      where: { OR: [{ id: dto.shipmentId }, { shipment_code: dto.shipmentId }] },
    });

    if (shipment) {
      shipmentCode = shipment.shipment_code;
      // Cập nhật trạng thái hải quan trên Shipment
      await this.prisma.internationalShipment.update({
        where: { id: shipment.id },
        data: {
          customs_status: dto.channel === 'GREEN' ? 'CLEARED' : dto.channel,
          ...(dto.status === 'CLEARED' && { status: 'CUSTOMS_CLEARED' }),
        },
      });
    }

    const record = await this.prisma.customsDeclaration.create({
      data: {
        declaration_no: declNo,
        shipment_id: dto.shipmentId,
        shipment_code: shipmentCode,
        customs_branch: dto.customsBranch,
        declaration_type: dto.declarationType,
        channel: (dto.channel as any) || 'GREEN',
        hs_code: dto.hsCode || '8471.30.20',
        commodity_description: dto.commodityDescription || 'Hàng hóa xuất nhập khẩu tiêu chuẩn',
        invoice_value: dto.invoiceValue || 10000,
        currency: dto.currency || 'USD',
        import_tax_amount: dto.importTaxAmount || 0,
        vat_tax_amount: dto.vatTaxAmount || 0,
        status: dto.status || 'REGISTERED',
        registered_date: dto.registeredDate ? new Date(dto.registeredDate) : new Date(),
        cleared_date: dto.status === 'CLEARED' ? new Date() : null,
      },
    });

    return this.mapCustoms(record);
  }

  async updateCustomsStatus(id: string, status: 'DRAFT' | 'REGISTERED' | 'CLEARED' | 'REJECTED'): Promise<CustomsDeclaration> {
    const decl = await this.prisma.customsDeclaration.findFirst({
      where: { OR: [{ id }, { declaration_no: id }] },
    });

    if (!decl) throw new NotFoundException('Không tìm thấy tờ khai hải quan');

    const updateData: any = { status };
    if (status === 'CLEARED') {
      updateData.cleared_date = new Date();
      // Đồng bộ sang shipment
      await this.prisma.internationalShipment.updateMany({
        where: { shipment_code: decl.shipment_code },
        data: { customs_status: 'CLEARED', status: 'CUSTOMS_CLEARED' },
      });
    }

    const updated = await this.prisma.customsDeclaration.update({
      where: { id: decl.id },
      data: updateData,
    });

    return this.mapCustoms(updated);
  }

  // ================= CONTAINERS & RATES API =================
  async getContainers(): Promise<ContainerTrackingItem[]> {
    const list = await this.prisma.containerTracking.findMany({
      orderBy: { created_at: 'desc' },
    });
    return list.map((c) => this.mapContainer(c));
  }

  async getPorts(): Promise<InternationalPort[]> {
    const list = await this.prisma.internationalPort.findMany({
      orderBy: { code: 'asc' },
    });
    return list.map((p) => this.mapPort(p));
  }

  async getExchangeRates(): Promise<ExchangeRateItem[]> {
    const list = await this.prisma.exchangeRate.findMany({
      orderBy: { currency: 'asc' },
    });
    return list.map((e) => this.mapExchangeRate(e));
  }

  async getLocalCharges(): Promise<LocalChargeItem[]> {
    const list = await this.prisma.localCharge.findMany({
      orderBy: { code: 'asc' },
    });
    return list.map((c) => this.mapLocalCharge(c));
  }

  // ================= SMART HS CODE & FTA TAX ENGINE =================
  async searchHsCodes(query?: string): Promise<HsCodeItem[]> {
    const where: any = {};
    if (query && query.trim()) {
      const q = query.trim();
      where.OR = [
        { hs_code: { contains: q, mode: 'insensitive' } },
        { description_vi: { contains: q, mode: 'insensitive' } },
        { description_en: { contains: q, mode: 'insensitive' } },
        { specialized_inspection: { contains: q, mode: 'insensitive' } },
      ];
    }
    const list = await this.prisma.hsCode.findMany({
      where,
      orderBy: { hs_code: 'asc' },
    });
    return list.map((h) => this.mapHsCode(h));
  }

  async calculateFtaTaxes(dto: {
    hsCode: string;
    invoiceValue: number;
    currency: string;
    originFta?: string;
  }) {
    let item = await this.prisma.hsCode.findUnique({
      where: { hs_code: dto.hsCode },
    });

    if (!item) {
      item = await this.prisma.hsCode.findFirst();
    }

    if (!item) {
      throw new NotFoundException('Không tìm thấy thông tin biểu thuế mã HS');
    }

    const rateUsd = 25450;
    const valueVnd = (dto.currency === 'USD' ? dto.invoiceValue : dto.invoiceValue * 1.1) * rateUsd;

    let applicableDutyRate = item.mfn_rate;
    let ftaName = 'MFN (Tối huệ quốc)';

    switch (dto.originFta) {
      case 'EVFTA':
        applicableDutyRate = item.evfta_rate;
        ftaName = 'EVFTA (Việt Nam - Liên minh Châu Âu EU)';
        break;
      case 'CPTPP':
        applicableDutyRate = item.cptpp_rate;
        ftaName = 'CPTPP (Hiệp định Đối tác Toàn diện và Tiến bộ)';
        break;
      case 'ACFTA':
        applicableDutyRate = item.acfta_rate;
        ftaName = 'ACFTA Form E (ASEAN - Trung Quốc)';
        break;
      case 'ATIGA':
        applicableDutyRate = item.atiga_rate;
        ftaName = 'ATIGA Form D (Nội khối ASEAN)';
        break;
      case 'VKFTA':
        applicableDutyRate = item.vkfta_rate;
        ftaName = 'VKFTA Form AK (Việt Nam - Hàn Quốc)';
        break;
      default:
        applicableDutyRate = item.mfn_rate;
    }

    const standardDutyVnd = (valueVnd * item.standard_duty_rate) / 100;
    const mfnDutyVnd = (valueVnd * item.mfn_rate) / 100;
    const applicableDutyVnd = (valueVnd * applicableDutyRate) / 100;
    const vatVnd = ((valueVnd + applicableDutyVnd) * item.vat_rate) / 100;
    const totalTaxVnd = applicableDutyVnd + vatVnd;
    const dutySavingsVnd = standardDutyVnd - applicableDutyVnd;

    return {
      hsCode: item.hs_code,
      descriptionVi: item.description_vi,
      ftaName,
      applicableDutyRate,
      mfnRate: item.mfn_rate,
      standardDutyRate: item.standard_duty_rate,
      vatRate: item.vat_rate,
      cifValueVnd: Math.round(valueVnd),
      applicableDutyVnd: Math.round(applicableDutyVnd),
      vatVnd: Math.round(vatVnd),
      totalTaxVnd: Math.round(totalTaxVnd),
      dutySavingsVnd: Math.round(dutySavingsVnd),
      specializedInspection: item.specialized_inspection,
      inspectionAgency: item.inspection_agency,
      importConditions: item.import_conditions,
    };
  }

  // ================= SHIPMENT FINANCIALS P&L =================
  async getShipmentFinancials(): Promise<ShipmentFinancialPnl[]> {
    const list = await this.prisma.shipmentFinancial.findMany({
      orderBy: { created_at: 'desc' },
    });
    return list.map((f) => this.mapFinancial(f));
  }

  // ================= CONTAINER DEPOSITS & EIR =================
  async getContainerDeposits(): Promise<ContainerDepositItem[]> {
    const list = await this.prisma.containerDeposit.findMany({
      orderBy: { deposited_date: 'desc' },
    });
    return list.map((d) => this.mapDeposit(d));
  }

  async refundContainerDeposit(
    id: string,
    dto: {
      status: 'REFUNDED_FULL' | 'DEDUCTED_REPAIR';
      refundedAmountVnd?: number;
      deductedReason?: string;
    }
  ): Promise<ContainerDepositItem> {
    const deposit = await this.prisma.containerDeposit.findFirst({
      where: { OR: [{ id }, { container_no: id }] },
    });
    if (!deposit) throw new NotFoundException('Không tìm thấy thông tin tiền cược vỏ');

    const refundedAmount =
      dto.refundedAmountVnd !== undefined
        ? dto.refundedAmountVnd
        : dto.status === 'REFUNDED_FULL'
        ? deposit.deposit_amount_vnd
        : deposit.deposit_amount_vnd - 500000;

    const updated = await this.prisma.containerDeposit.update({
      where: { id: deposit.id },
      data: {
        refund_status: dto.status,
        refunded_amount_vnd: refundedAmount,
        ...(dto.deductedReason && { deducted_reason: dto.deductedReason }),
      },
    });

    return this.mapDeposit(updated);
  }

  // ================= LIVE AIS VESSEL TRACKING =================
  async getVesselTracking(): Promise<VesselAisTrackingItem[]> {
    const list = await this.prisma.vesselAisTracking.findMany({
      orderBy: { updated_at: 'desc' },
    });
    return list.map((v) => this.mapVessel(v));
  }

  // ================= SHIPPING DOCUMENTS VAULT =================
  async getShippingDocuments(shipmentCode?: string): Promise<ShippingDocument[]> {
    const where: any = {};
    if (shipmentCode) {
      where.shipment_code = shipmentCode;
    }
    const list = await this.prisma.shippingDocumentRecord.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return list.map((d) => this.mapShippingDocument(d));
  }

  async verifyShippingDocument(
    id: string,
    dto: { status: 'VERIFIED' | 'REJECTED'; verificationNotes?: string }
  ): Promise<ShippingDocument> {
    const doc = await this.prisma.shippingDocumentRecord.findUnique({
      where: { id },
    });
    if (!doc) throw new NotFoundException('Không tìm thấy chứng từ xuất nhập khẩu');

    const updated = await this.prisma.shippingDocumentRecord.update({
      where: { id },
      data: {
        status: dto.status,
        ...(dto.verificationNotes && { verification_notes: dto.verificationNotes }),
      },
    });

    return this.mapShippingDocument(updated);
  }

  async createShippingDocument(dto: Partial<ShippingDocument>): Promise<ShippingDocument> {
    const record = await this.prisma.shippingDocumentRecord.create({
      data: {
        shipment_id: dto.shipmentId || 'shp-custom',
        shipment_code: dto.shipmentCode || 'EXP-2026-001',
        document_type: dto.documentType || 'BILL_OF_LADING',
        document_number: dto.documentNumber || `DOC-${Date.now().toString().slice(-6)}`,
        issue_date: dto.issueDate ? new Date(dto.issueDate) : new Date(),
        issuer: dto.issuer || 'Đơn vị phát hành',
        file_format: dto.fileFormat || 'PDF',
        status: dto.status || 'ISSUED',
        verification_notes: dto.verificationNotes,
        is_mandatory: dto.isMandatory !== undefined ? dto.isMandatory : true,
      },
    });
    return this.mapShippingDocument(record);
  }

  async deleteShippingDocument(id: string): Promise<boolean> {
    const doc = await this.prisma.shippingDocumentRecord.findUnique({ where: { id } });
    if (!doc) return false;
    await this.prisma.shippingDocumentRecord.delete({ where: { id } });
    return true;
  }

  // ================= CONTAINER DRAYAGE DISPATCH =================
  async getDrayageDispatches(shipmentCode?: string): Promise<ContainerDrayageDispatchItem[]> {
    const where: any = {};
    if (shipmentCode) {
      where.shipment_code = shipmentCode;
    }
    const list = await this.prisma.containerDrayageDispatch.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return list.map((d) => this.mapDrayage(d));
  }

  async createDrayageDispatch(dto: Partial<ContainerDrayageDispatchItem>): Promise<ContainerDrayageDispatchItem> {
    const code = `DO-TRUCK-${Date.now().toString().slice(-4)}`;
    const record = await this.prisma.containerDrayageDispatch.create({
      data: {
        dispatch_code: code,
        shipment_code: dto.shipmentCode || 'IMP-2026-005',
        container_no: dto.containerNo || 'HLXU4819201',
        container_type: dto.containerType || '40HC',
        dispatch_type: dto.dispatchType || 'PORT_TO_DOOR',
        pickup_location: dto.pickupLocation || 'Cảng Tân Cảng Cát Lái',
        delivery_location: dto.deliveryLocation || 'Kho Nhà Máy',
        tractor_plate: dto.tractorPlate || '51C-881.92',
        trailer_plate: dto.trailerPlate || '51R-441.20',
        driver_name: dto.driverName || 'Nguyễn Văn Hùng',
        driver_phone: dto.driverPhone || '0918.441.291',
        driver_license_grade: 'FC',
        appointment_time: dto.appointmentTime ? new Date(dto.appointmentTime) : new Date(Date.now() + 86400000),
        status: 'DISPATCHED',
        toll_fee_vnd: dto.tollFeeVnd || 180000,
        fuel_estimated_liters: dto.fuelEstimatedLiters || 45,
        notes: dto.notes,
      },
    });

    return this.mapDrayage(record);
  }

  async updateDrayageStatus(
    id: string,
    status: 'PENDING_DISPATCH' | 'DISPATCHED' | 'PULLED_FROM_PORT' | 'DELIVERED_FACTORY' | 'COMPLETED'
  ): Promise<ContainerDrayageDispatchItem> {
    const item = await this.prisma.containerDrayageDispatch.findFirst({
      where: { OR: [{ id }, { dispatch_code: id }] },
    });

    if (!item) throw new NotFoundException('Không tìm thấy lệnh điều độ xe');

    const updated = await this.prisma.containerDrayageDispatch.update({
      where: { id: item.id },
      data: { status },
    });

    return this.mapDrayage(updated);
  }

  // ================= AI IMPORT ANALYSIS & AUTO-DISPATCH =================
  async getAiImportAnalysis(shipmentCode: string): Promise<AiImportAnalysisReport> {
    let shipment = await this.prisma.internationalShipment.findFirst({
      where: { shipment_code: shipmentCode },
    });

    if (!shipment) {
      shipment = await this.prisma.internationalShipment.findFirst();
    }

    const isCustomsCleared = shipment?.customs_status === 'CLEARED';
    const isReefer = shipment?.container_type?.includes('RF');
    const freightAmount = shipment?.freight_amount || 2500;
    const packageCount = shipment?.package_count || 100;
    const podPort = shipment?.pod_port || 'Cảng Tân Cảng Cát Lái';

    return {
      shipmentCode: shipment?.shipment_code || shipmentCode,
      analyzedAt: new Date().toISOString(),
      overallRiskScore: isCustomsCleared ? 18 : 64,
      riskLevel: isCustomsCleared ? 'LOW_SAFE' : 'MEDIUM_CAUTION',
      portCongestionPrediction: {
        portCode: 'VNSGN',
        portName: podPort,
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
        fobValueVnd: Math.round(freightAmount * 25450 * 5.2),
        freightAndInsuranceVnd: Math.round(freightAmount * 25450),
        importTaxAndVatVnd: Math.round(freightAmount * 25450 * 0.18),
        portAndLocalChargesVnd: 5400000,
        inlandDrayageTruckingVnd: 4200000,
        totalLandedCostVnd: Math.round(freightAmount * 25450 * 6.6) + 9600000,
        costPerUnitVnd: Math.round((freightAmount * 25450 * 6.6 + 9600000) / Math.max(1, packageCount)),
        unitName: packageCount > 100 ? 'Carton' : 'Kiện / Unit',
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
    const existing = await this.prisma.containerDrayageDispatch.findFirst({
      where: { shipment_code: shipmentCode },
    });

    if (existing) {
      const updated = await this.prisma.containerDrayageDispatch.update({
        where: { id: existing.id },
        data: {
          status: 'DISPATCHED',
          appointment_time: new Date(),
        },
      });
      return { dispatch: this.mapDrayage(updated), analysis };
    }

    const newDispatch = await this.prisma.containerDrayageDispatch.create({
      data: {
        dispatch_code: `DO-AI-${Date.now().toString().slice(-4)}`,
        shipment_code: shipmentCode,
        container_no: 'AUTO-CONT-8819',
        container_type: '40HC',
        dispatch_type: 'PORT_TO_DOOR',
        pickup_location: analysis.portCongestionPrediction.portName,
        delivery_location: 'Kho Nhà Máy Consignee',
        tractor_plate: '51C-881.92',
        trailer_plate: '51R-441.20',
        driver_name: 'Nguyễn Văn Hùng (AI Matched)',
        driver_phone: '0918.441.291',
        driver_license_grade: 'FC',
        appointment_time: new Date(),
        status: 'DISPATCHED',
        toll_fee_vnd: 180000,
        fuel_estimated_liters: 45,
        notes: 'Được điều phối tự động bởi thuật toán AI Smart Drayage Dispatcher',
      },
    });

    return { dispatch: this.mapDrayage(newDispatch), analysis };
  }

  async createLocalCharge(dto: LocalChargeItem): Promise<LocalChargeItem> {
    const record = await this.prisma.localCharge.upsert({
      where: { code: dto.code },
      update: {
        name: dto.name,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency,
        applied_unit: dto.appliedUnit,
      },
      create: {
        code: dto.code,
        name: dto.name,
        description: dto.description,
        amount: dto.amount,
        currency: dto.currency,
        applied_unit: dto.appliedUnit,
      },
    });
    return this.mapLocalCharge(record);
  }

  async updateExchangeRates(rates: ExchangeRateItem[]): Promise<ExchangeRateItem[]> {
    for (const r of rates) {
      await this.prisma.exchangeRate.upsert({
        where: { currency: r.currency },
        update: {
          name: r.name,
          buy_rate_vnd: r.buyRateVnd,
          transfer_rate_vnd: r.transferRateVnd,
          sell_rate_vnd: r.sellRateVnd,
          updated_at: new Date(),
        },
        create: {
          currency: r.currency,
          name: r.name,
          buy_rate_vnd: r.buyRateVnd,
          transfer_rate_vnd: r.transferRateVnd,
          sell_rate_vnd: r.sellRateVnd,
        },
      });
    }
    return this.getExchangeRates();
  }
}
