import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateInvoiceItemDto {
  @IsNotEmpty({ message: 'Mô tả dịch vụ không được để trống' })
  @IsString()
  description: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  unit_price: number;
}

export class CreateInvoiceDto {
  @IsNotEmpty({ message: 'Khách hàng không được để trống' })
  @IsString()
  customer_id: string;

  @IsNotEmpty({ message: 'Hạn thanh toán không được để trống' })
  @IsString()
  due_date: string;

  @IsOptional()
  @IsNumber()
  vat_rate?: number; // Ví dụ 0.08 hoặc 0.1

  @IsOptional()
  @IsNumber()
  discount_amount?: number;

  @IsOptional()
  @IsString()
  payment_terms?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsNotEmpty({ message: 'Danh sách dòng cước không được để trống' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}
