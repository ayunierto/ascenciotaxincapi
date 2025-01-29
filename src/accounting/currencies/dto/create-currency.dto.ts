import { IsNotEmpty, IsString } from 'class-validator';

export class CreateCurrencyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  coinSuffix: string;

  @IsString()
  @IsNotEmpty()
  symbol: string;
}
