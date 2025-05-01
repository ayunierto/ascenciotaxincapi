import {
  IsDate,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsString()
  @MinLength(3)
  lastName: string;

  @IsOptional()
  countryCode?: string;

  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(50)
  @IsOptional()
  // @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
  //   message:
  //     'The password must have a Uppercase, lowercase letter and a number',
  // })
  password?: string;

  // TODO: Implement later
  @IsDate()
  @IsOptional()
  birthdate?: Date;
}
