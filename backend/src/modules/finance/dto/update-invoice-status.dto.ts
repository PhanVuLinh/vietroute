import { IsEnum, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
import { InvoiceStatus } from '@prisma/client';

export class UpdateInvoiceStatusDto {
  @IsNotEmpty({ message: 'Trạng thái hóa đơn không được để trống' })
  @IsEnum(InvoiceStatus, { message: 'Trạng thái hóa đơn không hợp lệ' })
  status: InvoiceStatus;

  @IsOptional()
  @IsNumber()
  paid_amount?: number;
}
