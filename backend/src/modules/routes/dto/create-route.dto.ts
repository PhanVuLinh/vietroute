import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { RouteStatus } from '@prisma/client';

export class CreateRouteStopDto {
  @IsOptional()
  @IsString()
  deliveryId?: string;

  @IsNumber()
  sequence: number;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

  @IsOptional()
  @IsString()
  customerName?: string;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  orderCode?: string;

  @IsOptional()
  @IsNumber()
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  packageCount?: number;

  @IsOptional()
  @IsString()
  timeWindowStart?: string;

  @IsOptional()
  @IsString()
  timeWindowEnd?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateRouteDto {
  @IsString()
  routeCode: string;

  @IsOptional()
  @IsString()
  routeName?: string;

  @IsString()
  driverId: string;

  @IsString()
  vehicleId: string;

  @IsString()
  warehouseId: string;

  @IsNumber()
  totalDistance: number;

  @IsNumber()
  estimatedDuration: number;

  @IsOptional()
  @IsEnum(RouteStatus)
  status?: RouteStatus;

  @IsOptional()
  @IsNumber()
  tollFeeEstVND?: number;

  @IsOptional()
  @IsNumber()
  fuelEstLiters?: number;

  @IsOptional()
  @IsNumber()
  totalWeightKg?: number;

  @IsOptional()
  @IsNumber()
  totalVolumeM3?: number;

  @IsOptional()
  polyline?: any;

  @IsOptional()
  trafficAlerts?: any;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStopDto)
  stops?: CreateRouteStopDto[];
}
