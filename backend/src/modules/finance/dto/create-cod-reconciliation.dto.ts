 import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '@prisma/client';

export class CreateCodEntryDto {
  @IsNotEmpty({ message: 'Mã đơn hàng không được để trống' })
  @IsString()
  order_id: string;

  @IsNumber()
  expected_cod: number;

  @IsNumber()
  actual_collected: number;

  @IsOptional()
  payment_method?: PaymentMethod; 

  @IsOptional()
  discrepancy_reason?: string;
}

export class CreateCodReconciliationDto {
  @IsNotEmpty({ message: 'Tài xế không được để trống' })
  @IsString()
  driver_id: string;

  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCodEntryDto)
  entries?: CreateCodEntryDto[];
}
