import { IsMobilePhone, IsString, MinLength } from 'class-validator';

export class VerifyUserDto {
  @IsString()
  phone_number: string;

  @IsString()
  verfication_code: string;
}
