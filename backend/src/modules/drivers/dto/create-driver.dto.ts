import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { DriverStatus, LicenseType } from '@prisma/client';

export class CreateDriverDto {
  @IsString()
  driverCode: string;

  @IsString()
  fullName: string;

  @IsString()
  phone: string;

  @IsString()
  licenseNumber: string;

  @IsEnum(LicenseType)
  licenseType: LicenseType;

  @IsString()
  licenseExpiredAt: string;

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
}
