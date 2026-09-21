import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { CustomerType, CustomerTier } from '@prisma/client';

export class CreateCustomerDto {
  @IsNotEmpty({ message: 'Tên khách hàng không được để trống' })
  @IsString()
  name: string;

  @IsNotEmpty({ message: 'Số điện thoại không được để trống' })
  @IsString()
  phone: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng' })
  email?: string;

  @IsNotEmpty({ message: 'Địa chỉ không được để trống' })
  @IsString()
  address: string;

  @IsNumber()
  latitude: number;

  @IsNumber()
  longitude: number;

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
