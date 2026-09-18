import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VehicleType, VehicleStatus } from '@prisma/client';

export class CreateVehicleDto {
  @IsString()
  vehicleCode: string;

  @IsString()
  licensePlate: string;

  @IsOptional()
  @IsEnum(VehicleType)
  type?: VehicleType;

  @IsString()
  brand: string;

  @IsString()
  model: string;

  @IsNumber()
  capacityWeight: number;

  @IsNumber()
  capacityVolume: number;

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
