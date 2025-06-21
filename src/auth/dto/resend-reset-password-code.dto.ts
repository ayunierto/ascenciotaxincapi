import { IsEmail, IsNotEmpty } from 'class-validator';

export class ResendResetPasswordCodeDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
