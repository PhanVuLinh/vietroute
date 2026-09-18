import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DriverStatus, LicenseType } from '@prisma/client';

export class UpdateDriverDto {
  @IsOptional()
  @IsString()
  driverCode?: string;

  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsEnum(LicenseType)
  licenseType?: LicenseType;

  @IsOptional()
  @IsString()
  licenseExpiredAt?: string;

  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  currentVehicleId?: string;

  @IsOptional()
  @IsNumber()
  currentLocationLat?: number;

  @IsOptional()
  @IsNumber()
  currentLocationLng?: number;

  @IsOptional()
  @IsNumber()
  onTimeRate?: number;

  @IsOptional()
  @IsNumber()
  successRate?: number;
}
