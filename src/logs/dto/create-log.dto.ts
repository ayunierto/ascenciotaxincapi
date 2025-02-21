import { IsString } from 'class-validator';

export class CreateLogDto {
  @IsString()
  description: string;
}
