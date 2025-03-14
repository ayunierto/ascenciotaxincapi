import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsInt()
  duration: number;

  @IsNumber()
  price: number;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  address: string;

  @IsBoolean()
  isAvailableOnline: boolean;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsArray()
  @ArrayMinSize(1)
  staff: string[];
}
