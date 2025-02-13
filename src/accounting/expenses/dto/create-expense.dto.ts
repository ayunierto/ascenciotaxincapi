import { IsUrl } from 'class-validator';
import {
  IsArray,
  IsDate,
  IsDecimal,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  merchant: string;

  @IsString()
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
