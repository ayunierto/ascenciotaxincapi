import { IsISO8601, IsUrl } from 'class-validator';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  merchant: string;

  @IsString()
  @IsISO8601()
  date: string;

  @IsNumber({ maxDecimalPlaces: 2 })
  total: number;

  @IsNumber({ maxDecimalPlaces: 2 })
  tax: number;

  @IsUrl()
  @IsOptional()
  image?: string;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  @IsOptional()
  subcategoryId?: number;

  @IsNumber()
  accountId: number;

  @IsArray()
  @IsOptional()
  tagsIds: number[];

  @IsString()
  @IsOptional()
  notes?: string;
}
