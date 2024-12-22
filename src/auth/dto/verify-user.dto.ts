import { IsMobilePhone, IsString, MinLength } from 'class-validator';

export class VerifyUserDto {
  @IsString()
  phoneNumber: string;

  @IsString()
  verficationCode: string;
}
