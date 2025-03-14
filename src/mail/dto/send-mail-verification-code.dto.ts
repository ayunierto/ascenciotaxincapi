import { IsEmail, IsString } from 'class-validator';

export class SendMailVerificationCodeDto {
  @IsString()
  @IsEmail()
  to: string;

  @IsString()
  clientName: string;

  @IsString()
  verificationCode: string;
}
