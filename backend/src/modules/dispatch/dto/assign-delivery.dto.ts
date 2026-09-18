import { IsEnum, IsOptional, IsString } from 'class-validator';
import { AssignmentType } from '@prisma/client';

export class AssignDeliveryDto {
  @IsString()
  deliveryId: string;

  @IsString()
  driverId: string;

  @IsString()
  vehicleId: string;

  @IsOptional()
  @IsEnum(AssignmentType)
  assignmentType?: AssignmentType;
}
