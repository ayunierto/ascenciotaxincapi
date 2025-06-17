import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ValidRoles } from 'src/auth/interfaces';

export class CreateUserDto {
  @IsString()
  @MinLength(3)
  name: string;

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

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  // @Matches(
  //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])[A-Za-z\d!@#$%^&*(),.?":{}|<>_]{8,}$/,
  //   {
  //     message:
  //       'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character',
  //   },
  // )
  password: string;

  @IsBoolean()
  isActive: boolean;

  @IsDate()
  birthdate?: Date;

  @IsDate()
  registrationDate: Date;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  roles: ValidRoles[];
}
