import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class ChangePasswordDto {
  @IsNotEmpty() @IsString() oldPassword: string;
  @IsNotEmpty()
  @IsString()
  @MinLength(6) // Adjust length as needed
  // Add complexity regex if desired: @Matches(/.../)
  newPassword: string;
}
