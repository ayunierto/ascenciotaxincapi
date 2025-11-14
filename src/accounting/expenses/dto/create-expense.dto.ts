import { IsISO8601, IsUrl } from 'class-validator';
import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

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
  imageUrl?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  categoryId: string;

  @IsString()
  @IsOptional()
  subcategoryId?: string;
}
