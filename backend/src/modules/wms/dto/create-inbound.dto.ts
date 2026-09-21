import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { InboundStatus } from '@prisma/client';

export class CreateInboundDto {
  @IsNotEmpty({ message: 'Kho không được để trống' })
  @IsString()
  warehouse_id: string;

  @IsNotEmpty({ message: 'Mã phiếu nhập không được để trống' })
  @IsString()
  receipt_code: string;

  @IsNotEmpty({ message: 'Nhà cung cấp không được để trống' })
  @IsString()
  supplier_name: string;

  @IsNumber()
  item_count: number;

  @IsNumber()
  total_weight: number;

  @IsOptional()
  @IsEnum(InboundStatus)
  status?: InboundStatus;

  @IsNotEmpty({ message: 'Người tiếp nhận không được để trống' })
  @IsString()
  received_by: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
