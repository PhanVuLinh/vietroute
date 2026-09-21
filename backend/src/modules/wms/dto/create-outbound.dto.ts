import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { OutboundStatus } from '@prisma/client';

export class CreateOutboundDto {
  @IsNotEmpty({ message: 'Kho không được để trống' })
  @IsString()
  warehouse_id: string;

  @IsNotEmpty({ message: 'Mã phiếu xuất không được để trống' })
  @IsString()
  dispatch_code: string;

  @IsOptional()
  @IsString()
  order_code?: string;

  @IsOptional()
  @IsString()
  route_code?: string;

  @IsNumber()
  item_count: number;

  @IsNumber()
  total_weight: number;

  @IsOptional()
  @IsEnum(OutboundStatus)
  status?: OutboundStatus;

  @IsNotEmpty({ message: 'Người lấy hàng không được để trống' })
  @IsString()
  picked_by: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
