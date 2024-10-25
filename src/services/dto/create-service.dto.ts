import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateServiceDto {
  @IsString()
  id?: string;

  @IsString()
  @MinLength(3)
  title: string;

  @IsBoolean()
  isAvailableOnline: boolean;

  @IsBoolean()
  isActive: boolean;

  @IsString()
  duration: string;

  @IsString()
  @IsOptional()
  description?: string;
}
