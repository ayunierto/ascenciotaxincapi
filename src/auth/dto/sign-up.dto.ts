import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsTimeZone,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3, { message: 'The name must have a minimum of 3 characters' })
  firstName: string;

  @IsString()
  @MinLength(3, {
    message: 'The last name must have a minimum of 3 characters',
  })
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  countryCode?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsTimeZone()
  timeZone: string;

  @IsString()
  @IsOptional()
  locale?: string;
}
