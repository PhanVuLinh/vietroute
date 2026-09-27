import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateInternationalShipmentDto {
  @IsNotEmpty({ message: 'Mã lô hàng không được để trống' })
  @IsString()
  shipmentCode: string;

  @IsNotEmpty({ message: 'Hướng vận chuyển không được để trống' })
  @IsString()
  direction: 'EXPORT' | 'IMPORT' | 'CROSS_BORDER';

  @IsNotEmpty({ message: 'Phương thức vận tải không được để trống' })
  @IsString()
  transportMode: 'OCEAN_FCL' | 'OCEAN_LCL' | 'AIR_FREIGHT' | 'ROAD_CROSS_BORDER';

  @IsNotEmpty({ message: 'Điều kiện thương mại Incoterm không được để trống' })
  @IsString()
  incoterm: 'FOB' | 'CIF' | 'EXW' | 'DDP' | 'DAP' | 'CFR' | 'FCA';

  @IsNotEmpty({ message: 'Hãng vận chuyển không được để trống' })
  @IsString()
  carrierName: string;

  @IsOptional()
  @IsString()
  vesselFlightNo?: string;

  @IsNotEmpty({ message: 'Cảng bốc / Điểm đi không được để trống' })
  @IsString()
  polPort: string;

  @IsNotEmpty({ message: 'Cảng dỡ / Điểm đến không được để trống' })
  @IsString()
  podPort: string;

  @IsOptional()
  @IsString()
  etdDate?: string;

  @IsOptional()
  @IsString()
  etaDate?: string;

  @IsOptional()
  @IsString()
  blAwbNumber?: string;

  @IsOptional()
  @IsString()
  containerNumber?: string;

  @IsOptional()
  @IsString()
  sealNumber?: string;

  @IsOptional()
  @IsString()
  containerType?: string;

  @IsOptional()
  @IsNumber()
  grossWeightKg?: number;

  @IsOptional()
  @IsNumber()
  cbmVolume?: number;

  @IsOptional()
  @IsNumber()
  packageCount?: number;

  @IsOptional()
  @IsString()
  shipperName?: string;

  @IsOptional()
  @IsString()
  consigneeName?: string;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  freightAmount?: number;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
