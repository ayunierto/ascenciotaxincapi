import { IsArray, IsDecimal, IsString } from 'class-validator';

export class CreatePlanDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsDecimal()
  price: number;

  @IsString({ each: true })
  @IsArray()
  features: string[];
}
