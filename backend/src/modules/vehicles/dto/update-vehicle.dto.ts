import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VehicleType, VehicleStatus } from '@prisma/client';

export class UpdateVehicleDto {
  @IsOptional()
  @IsString()
  vehicleCode?: string;

  @IsOptional()
  @IsString()
  licensePlate?: string;

  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  model?: string;

  @IsOptional()
  @IsNumber()
  capacityWeight?: number;

  @IsOptional()
  @IsNumber()
  capacityVolume?: number;

  @IsOptional()
  @IsNumber()
  currentMileage?: number;

  @IsOptional()
  @IsNumber()
  fuelPercent?: number;

  @IsOptional()
  @IsEnum(VehicleStatus)
  status?: VehicleStatus;

  @IsOptional()
  @IsString()
  driverId?: string;

  @IsOptional()
  @IsString()
  nextMaintenanceDate?: string;

  @IsOptional()
  @IsString()
  inspectionCertificateNumber?: string;

  @IsOptional()
  @IsString()
  lastInspectionDate?: string;

  @IsOptional()
  @IsString()
  inspectionExpiryDate?: string;

  @IsOptional()
  @IsString()
  insuranceExpiryDate?: string;

  @IsOptional()
  @IsString()
  inspectionCenter?: string;

  @IsOptional()
  @IsString()
  inspectionNotes?: string;
}
