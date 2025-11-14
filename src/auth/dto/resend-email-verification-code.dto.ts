import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendEmailVerificationCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
