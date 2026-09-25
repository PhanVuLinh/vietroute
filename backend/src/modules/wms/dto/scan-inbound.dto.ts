import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class ScanInboundDto {
  @IsNotEmpty({ message: 'Mã kho không được để trống' })
  @IsString()
  warehouseId: string;

  @IsOptional()
  @IsString()
  receiptCode?: string;

  @IsNotEmpty({ message: 'Mã vạch / QR không được để trống' })
  @IsString()
  barcode: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsString()
  productName?: string;

  @IsNotEmpty({ message: 'Mã phân khu (Zone Code) không được để trống' })
  @IsString()
  zoneCode: string;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  unit?: string;

  @IsOptional()
  @IsNumber()
  weightPerUnit?: number;

  @IsOptional()
  @IsString()
  scannedBy?: string;
}
