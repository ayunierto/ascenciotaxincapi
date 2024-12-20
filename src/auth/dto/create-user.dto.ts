import {
  IsBoolean,
  IsDate,
  IsDateString,
  IsEmail,
  IsLowercase,
  IsMobilePhone,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(3, { message: 'The name must have a minimum of 3 characters' })
  name: string;

  @IsString()
  @MinLength(3, {
    message: 'The last name must have a minimum of 3 characters',
  })
  last_name: string;

  @IsString()
  @IsEmail()
  @IsLowercase()
  email: string;

  @IsMobilePhone()
  phone_number: string;

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

  // @IsBoolean()
  // is_active: boolean;

  // @IsDate()
  // @IsOptional()
  // registration_date: Date;

  @IsDate()
  @IsOptional()
  last_login?: Date;

  // @IsArray()
  // roles: string[];

  @IsString()
  @IsOptional()
  verfication_code?: string;
}
