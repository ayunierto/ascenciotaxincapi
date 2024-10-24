import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  title: string;

  @IsBoolean()
  isAvailableOnline: boolean;

  @IsString()
  duration: string;

  @IsString()
  @IsOptional()
  description?: string;
}
