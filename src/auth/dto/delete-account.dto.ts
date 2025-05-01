import { IsNotEmpty, IsString } from 'class-validator';

export class DeleteAccountDto {
  @IsNotEmpty()
  @IsString()
  password: string;
}
