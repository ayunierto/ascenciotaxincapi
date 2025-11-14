import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class VerifyEmailCodeDto {
  @IsString()
  @MinLength(6, { message: 'The code must have a minimum of 6 characters' })
  @MaxLength(6, { message: 'The code must have a maximum of 6 characters' })
  code: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;
}
