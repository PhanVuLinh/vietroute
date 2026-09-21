import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { IncidentStatus } from '@prisma/client';

export class UpdateIncidentStatusDto {
  @IsNotEmpty({ message: 'Trạng thái không được để trống' })
  @IsEnum(IncidentStatus)
  status: IncidentStatus;

  @IsOptional()
  @IsString()
  resolution_note?: string;
}
