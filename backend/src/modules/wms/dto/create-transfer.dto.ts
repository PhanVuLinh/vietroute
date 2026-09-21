import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { TransferStatus } from '@prisma/client';

export class CreateTransferDto {
  @IsNotEmpty({ message: 'Kho xuất không được để trống' })
  @IsString()
  from_warehouse_id: string;

  @IsNotEmpty({ message: 'Kho đích không được để trống' })
  @IsString()
  to_warehouse_id: string;

  @IsNotEmpty({ message: 'Mã điều chuyển không được để trống' })
  @IsString()
  transfer_code: string;

  @IsNumber()
  item_count: number;

  @IsNumber()
  total_weight: number;

  @IsOptional()
  @IsEnum(TransferStatus)
  status?: TransferStatus;

  @IsNotEmpty({ message: 'Người tạo lệnh không được để trống' })
  @IsString()
  created_by: string;
}
