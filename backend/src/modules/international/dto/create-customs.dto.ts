import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateCustomsDeclarationDto {
  @IsNotEmpty({ message: 'Số tờ khai hải quan không được để trống' })
  @IsString()
  declarationNo: string;

  @IsNotEmpty({ message: 'Mã lô hàng liên kết không được để trống' })
  @IsString()
  shipmentId: string;

  @IsNotEmpty({ message: 'Chi cục hải quan không được để trống' })
  @IsString()
  customsBranch: string;

  @IsNotEmpty({ message: 'Mã loại hình XNK không được để trống' })
  @IsString()
  declarationType: string; // E31, B11, A11, H11, etc.

  @IsNotEmpty({ message: 'Luồng kiểm tra không được để trống' })
  @IsString()
  channel: 'GREEN' | 'YELLOW' | 'RED';

  @IsOptional()
  @IsString()
  hsCode?: string;

  @IsOptional()
  @IsString()
  commodityDescription?: string;

  @IsOptional()
  @IsNumber()
  invoiceValue?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  importTaxAmount?: number;

  @IsOptional()
  @IsNumber()
  vatTaxAmount?: number;

  @IsOptional()
  @IsString()
  status?: 'DRAFT' | 'REGISTERED' | 'CLEARED' | 'REJECTED';

  @IsOptional()
  @IsString()
  registeredDate?: string;
}
