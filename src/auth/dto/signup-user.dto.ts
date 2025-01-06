import {
  IsDate,
  IsDateString,
  IsEmail,
  IsEnum,
  IsLowercase,
  IsMobilePhone,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export type VerificationPlatform = 'email' | 'whatsapp' | 'sms';

export class SignupUserDto {
  @IsString()
  @MinLength(3, { message: 'The name must have a minimum of 3 characters' })
  name: string;

  @IsString()
  @MinLength(3, {
    message: 'The last name must have a minimum of 3 characters',
  })
  lastName: string;

  @IsString()
  @IsEmail()
  @IsLowercase()
  email: string;

  @IsString()
  countryCode: string;

  @IsMobilePhone()
  phoneNumber: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'The password must have a Uppercase, lowercase letter and a number',
  })
  password: string;

  @IsDateString()
  @IsOptional()
  birthdate?: Date;

  @IsDate()
  @IsOptional()
  lastLogin?: Date;

  @IsString()
  @IsOptional()
  verificationCode?: string;

  @IsString()
  verificationPlatform: VerificationPlatform;
}
