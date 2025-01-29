import { IsOptional, IsString } from 'class-validator';

export class CreateAccountTypeDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}
