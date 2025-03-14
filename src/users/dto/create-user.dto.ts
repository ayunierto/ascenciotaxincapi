import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsOptional,
  IsPhoneNumber,
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

  @IsPhoneNumber()
  @IsOptional()
  phoneNumber?: string;

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

  @IsDate()
  birthdate?: Date;

  @IsDate()
  registrationDate: Date;

  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  roles: ValidRoles[];
}
