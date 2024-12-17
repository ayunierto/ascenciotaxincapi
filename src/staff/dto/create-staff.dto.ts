import { IsString, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @MinLength(3)
  name: string;
}
