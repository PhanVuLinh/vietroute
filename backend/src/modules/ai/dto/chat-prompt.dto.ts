import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

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
