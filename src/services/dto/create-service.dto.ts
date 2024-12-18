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
  is_available_online: boolean;

  @IsBoolean()
  is_active: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsArray()
  staff: Staff[];
}
