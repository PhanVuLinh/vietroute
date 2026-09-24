import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SubmitCodDto {
  @IsNotEmpty({ message: 'Số tiền nộp không được để trống' })
  @IsNumber({}, { message: 'Số tiền nộp phải là số hợp lệ' })
  submitted_amount: number;

  @IsOptional()
  @IsString()
  cashier_name?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
