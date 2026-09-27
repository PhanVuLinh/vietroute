import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty({ message: 'Mã phòng ban không được để trống' })
  @IsString()
  code: string;

  @IsNotEmpty({ message: 'Tên phòng ban không được để trống' })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  headId?: string;

  @IsOptional()
  @IsString()
  headName?: string;

  @IsOptional()
  @IsString()
  headPhone?: string;

  @IsOptional()
  @IsString()
  headEmail?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  status?: 'ACTIVE' | 'INACTIVE';
}
