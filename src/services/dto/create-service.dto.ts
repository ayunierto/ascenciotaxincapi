import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateServiceDto {
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

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString({ each: true })
  @IsArray()
  staffMembers: string[];
}
