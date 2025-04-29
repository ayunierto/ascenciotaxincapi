import {
  IsEmail,
  IsLowercase,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @MinLength(3, { message: 'The name must have a minimum of 3 characters' })
  name: string;

  @IsString()
  @MinLength(3, {
    message: 'The last name must have a minimum of 3 characters',
  })
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  @IsLowercase()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(50)
  // @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message:
  //     'The password must have a Uppercase, lowercase letter and a number',
  // })
  password: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  // @IsPhoneNumber()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  locale?: string;
}
