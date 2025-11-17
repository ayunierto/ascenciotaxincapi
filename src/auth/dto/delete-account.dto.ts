import { IsNotEmpty, IsString, Min, MinLength } from 'class-validator';

export class DeleteAccountDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
