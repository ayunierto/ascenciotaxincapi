import { IsString, IsUrl } from 'class-validator';

export class CreatePostDto {
  @IsString()
  title: string;

  @IsUrl()
  @IsString()
  url: string;
}
