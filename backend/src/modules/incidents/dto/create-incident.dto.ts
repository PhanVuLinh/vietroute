import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IncidentSeverity, IncidentType } from '@prisma/client';

export class CreateIncidentDto {
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: 'Mô tả không được để trống' })
  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(IncidentType)
  type?: IncidentType;

  @IsOptional()
  @IsEnum(IncidentSeverity)
  severity?: IncidentSeverity;

  @IsOptional()
  @IsString()
  order_code?: string;

  @IsOptional()
  @IsString()
  driver_name?: string;

  @IsOptional()
  @IsString()
  vehicle_plate?: string;

  @IsOptional()
  @IsString()
  warehouse_name?: string;

  @IsNotEmpty({ message: 'Người báo cáo không được để trống' })
  @IsString()
  reported_by: string;

  @IsOptional()
  @IsString()
  assigned_to?: string;
}
