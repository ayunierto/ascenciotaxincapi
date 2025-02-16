import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsNumber()
  price: number;

  @IsString({ each: true })
  @IsArray()
  features: string[];

  @IsBoolean()
  status: boolean;
}
