import { IsNumber, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateAccountDto {
  @IsString()
  @MinLength(1)
  name: string;

  @IsString({
    message:
      "The icon name is used to represent the icon on the user's screen.",
  })
  @MinLength(1)
  icon: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  currencyId: number;

  @IsNumber()
  accountTypeId: number;
}
