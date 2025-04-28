import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class VerifyCodeDto {
  @IsNotEmpty() @IsEmail() email: string;
  @IsNotEmpty() @IsString() code: string; // The code the user entered
}
