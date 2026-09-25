import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BulkOrderItemDto {
  @IsString()
  @IsNotEmpty()
  receiverName: string;

  @IsString()
  @IsNotEmpty()
  receiverPhone: string;

  @IsString()
  @IsNotEmpty()
  receiverAddress: string;

  @IsNumber()
  @IsOptional()
  receiverLatitude?: number;

  @IsNumber()
  @IsOptional()
  receiverLongitude?: number;

  @IsNumber()
  @IsNotEmpty()
  weight: number; // kg

  @IsNumber()
  @IsOptional()
  volume?: number; // m3

  @IsNumber()
  @IsOptional()
  codAmount?: number; // VND

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  customerReference?: string; // Mã đơn riêng của khách
}

export class BulkCreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkOrderItemDto)
  orders: BulkOrderItemDto[];

  @IsString()
  @IsOptional()
  warehouseId?: string;

  @IsString()
  @IsOptional()
  batchNotes?: string;
}

export class PayDebtDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsString()
  @IsOptional()
  paymentMethod?: string; // VIETQR_NAPAS247, BANK_TRANSFER

  @IsString()
  @IsOptional()
  transactionRef?: string;
}
