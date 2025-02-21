import { IsNumber, IsString } from 'class-validator';

export class CreatePaymentSheetDto {
  @IsNumber()
  amount: number;

  @IsString()
  currency: string;
}
