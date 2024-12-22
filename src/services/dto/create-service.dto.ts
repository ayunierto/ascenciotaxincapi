import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { Staff } from 'src/staff/entities/staff.entity';

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

  @IsBoolean()
  isAvailableOnline: boolean;

  @IsBoolean()
  isActive: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  staff: string[];
}
