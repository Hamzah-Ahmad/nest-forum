import { IsNotEmpty, IsString } from 'class-validator';

export class UploadPostImageDto {
  @IsString()
  @IsNotEmpty()
  base64String: string;

  @IsString()
  @IsNotEmpty()
  mimeType: string;

  @IsString()
  @IsNotEmpty()
  postId: string;
}
