import { IsString } from 'class-validator';

export class VerifyUserDto {
  @IsString()
  username: string; // email | phoneNumber

  @IsString()
  verificationCode: string;
}
