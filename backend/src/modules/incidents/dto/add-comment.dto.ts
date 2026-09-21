import { IsNotEmpty, IsString } from 'class-validator';

export class AddIncidentCommentDto {
  @IsNotEmpty({ message: 'Người bình luận không được để trống' })
  @IsString()
  user: string;

  @IsNotEmpty({ message: 'Nội dung phản hồi không được để trống' })
  @IsString()
  message: string;
}
