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
