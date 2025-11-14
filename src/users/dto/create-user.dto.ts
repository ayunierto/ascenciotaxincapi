import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsTimeZone,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Role } from 'src/auth/enums/role.enum';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  firstName: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsString()
  @IsEmail()
  email: string;

  @IsOptional()
  countryCode?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsTimeZone()
  timeZone: string;

  @IsString()
  @IsOptional()
  locale?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isEmailVerified?: boolean;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  // @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message:
  //     'The password must have a Uppercase, lowercase letter and a number',
  // })
  password: string;

  @IsBoolean()
  isActive: boolean;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  roles: Role[];
}
