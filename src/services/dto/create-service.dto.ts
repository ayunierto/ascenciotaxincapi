import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  title_es: string;
  @IsString()
  @MinLength(3)
  title_en: string;
  @IsString()
  @IsOptional()
  description_es: string;
  @IsString()
  @IsOptional()
  description_en: string;
  @IsString()
  @MinLength(3)
  address: string;
  @IsInt()
  duration_minutes: number;
  @IsBoolean()
  is_online_available: boolean;
  @IsString()
  @IsUrl()
  @IsOptional()
  image_url?: string;
  @IsBoolean()
  is_active: boolean;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  staff_ids: string[];
}
