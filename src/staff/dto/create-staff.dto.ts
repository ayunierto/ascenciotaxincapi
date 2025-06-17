import { IsArray, IsBoolean, IsString, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @MinLength(3, {
    message: 'The name must have a minimum of 3 characters',
  })
  name: string;

  @IsString()
  @MinLength(3, {
    message: 'The last name must have a minimum of 3 characters',
  })
  lastName: string;

  @IsBoolean()
  isActive: boolean;

  @IsArray()
  services: string[];

  @IsArray()
  schedules: string[];
}
