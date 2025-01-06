import { IsString } from 'class-validator';
import { VerificationPlatform } from './signup-user.dto';

export class SendCodeDto {
  @IsString()
  username: string;

  @IsString()
  verificationPlatform: VerificationPlatform;
}
