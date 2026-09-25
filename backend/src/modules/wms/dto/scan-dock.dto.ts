import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ScanDockDto {
  @IsNotEmpty({ message: 'Mã kho không được để trống' })
  @IsString()
  warehouseId: string;

  @IsNotEmpty({ message: 'Mã lệnh xuất hoặc mã chuyến xe không được để trống' })
  @IsString()
  dispatchCode: string;

  @IsNotEmpty({ message: 'Mã vạch / QR kiện hàng không được để trống' })
  @IsString()
  barcode: string;

  @IsOptional()
  @IsString()
  scannedBy?: string;
}
