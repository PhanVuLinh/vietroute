import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  WarehouseType,
  WarehouseRegion,
  WarehouseStorageType,
  WarehouseStatus,
} from '@prisma/client';

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(WarehouseType)
  type?: WarehouseType;

  @IsOptional()
  @IsEnum(WarehouseRegion)
  region?: WarehouseRegion;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  openingTime?: string;

  @IsOptional()
  @IsString()
  closingTime?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsNumber()
  usedCapacity?: number;

  @IsOptional()
  @IsNumber()
  areaSqM?: number;

  @IsOptional()
  @IsNumber()
  totalPallets?: number;

  @IsOptional()
  @IsNumber()
  dockDoors?: number;

  @IsOptional()
  @IsEnum(WarehouseStorageType)
  storageType?: WarehouseStorageType;

  @IsOptional()
  @IsString()
  managerName?: string;

  @IsOptional()
  @IsString()
  managerPhone?: string;

  @IsOptional()
  @IsString()
  managerEmail?: string;

  @IsOptional()
  @IsEnum(WarehouseStatus)
  status?: WarehouseStatus;
}
