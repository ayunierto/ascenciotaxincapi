import { IsString, Matches } from 'class-validator';

export class SendMailVerificationCodeDto {
  @IsString()
  to: string;

  @IsString()
  clientName: string;

  @IsString()
  verificationCode: string;
}
