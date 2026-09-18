import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { OrderPriority, OrderStatus } from '@prisma/client';

export class CreateOrderItemDto {
  @IsString()
  productName: string;

  @IsNumber()
  quantity: number;

  @IsNumber()
  weight: number;

  @IsNumber()
  volume: number;

  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @IsOptional()
  @IsBoolean()
  isLiquid?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresSpecialHandling?: boolean;
}

export class CreateOrderDto {
  @IsString()
  orderCode: string;

  @IsString()
  customerId: string;

  @IsString()
  warehouseId: string;

  @IsString()
  receiverName: string;

  @IsString()
  receiverPhone: string;

  @IsString()
  receiverAddress: string;

  @IsNumber()
  receiverLatitude: number;

  @IsNumber()
  receiverLongitude: number;

  @IsOptional()
  @IsNumber()
  totalWeight?: number;

  @IsOptional()
  @IsNumber()
  totalVolume?: number;

  @IsOptional()
  @IsNumber()
  codAmount?: number;

  @IsOptional()
  @IsEnum(OrderPriority)
  priority?: OrderPriority;

  @IsOptional()
  @IsString()
  deliveryWindowStart?: string;

  @IsOptional()
  @IsString()
  deliveryWindowEnd?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}
