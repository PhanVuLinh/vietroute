import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ChatPromptDto {
  @IsString()
  @IsNotEmpty()
  prompt: string;

  @IsString()
  @IsOptional()
  conversationId?: string;
}

export class PredictEtaDto {
  @IsNumber()
  originLat: number;

  @IsNumber()
  originLng: number;

  @IsNumber()
  destLat: number;

  @IsNumber()
  destLng: number;

  @IsString()
  @IsOptional()
  vehicleType?: string;

  @IsNumber()
  @IsOptional()
  trafficMultiplier?: number;
}

export class RouteStopItemDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lng: number;

  @IsNumber()
  @IsOptional()
  demandKg?: number;

  @IsString()
  @IsOptional()
  timeWindow?: string;
}

export class OptimizeRouteDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopItemDto)
  stops: RouteStopItemDto[];

  @IsNumber()
  originLat: number;

  @IsNumber()
  originLng: number;

  @IsBoolean()
  @IsOptional()
  returnToOrigin?: boolean;
}

export class MatchDriverDto {
  @IsString()
  @IsOptional()
  orderId?: string;

  @IsNumber()
  pickupLat: number;

  @IsNumber()
  pickupLng: number;

  @IsNumber()
  totalWeightKg: number;

  @IsString()
  @IsOptional()
  requiredVehicleType?: string;

  @IsString()
  @IsOptional()
  priority?: string;
}
