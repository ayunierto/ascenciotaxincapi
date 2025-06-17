import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(30)
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])[A-Za-z\d!@#$%^&*(),.?":{}|<>_]{8,}$/,
  //   {
  //     message:
  //       'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
  //   },
  // )
  password: string;

  @IsOptional()
  @IsString()
  countryCode?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  locale?: string;
}
