import { IsEmail, IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { CustomerType, CustomerTier } from '@prisma/client';

export class UpdateCustomerDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsEnum(CustomerType)
  type?: CustomerType;

  @IsOptional()
  @IsEnum(CustomerTier)
  tier?: CustomerTier;

  @IsOptional()
  @IsString()
  tax_code?: string;

  @IsOptional()
  @IsString()
  contact_person?: string;

  @IsOptional()
  @IsString()
  website?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
