import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateDiscountsOnPlanDto {
  @IsNumber()
  @IsNotEmpty()
  months: number;

  @IsNumber()
  @IsNotEmpty()
  discount: number;

  @IsString()
  planId: string;
}
