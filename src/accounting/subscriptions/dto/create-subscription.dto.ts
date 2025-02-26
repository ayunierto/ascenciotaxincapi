import { IsArray, IsDateString, IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString({ each: true })
  @IsArray()
  features: string[];

  @IsString()
  status: string;
}
