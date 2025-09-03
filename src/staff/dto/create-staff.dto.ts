import { IsArray, IsBoolean, IsString, MinLength } from 'class-validator';

export class CreateStaffDto {
  @IsString()
  @MinLength(3, {
    message: 'The first name must have a minimum of 3 characters',
  })
  firstName: string;

  @IsString()
  @MinLength(3, {
    message: 'The last name must have a minimum of 3 characters',
  })
  lastName: string;

  @IsBoolean()
  isActive: boolean;

  @IsString({ each: true })
  @IsArray()
  services: string[];

  @IsString({ each: true })
  @IsArray()
  schedules: string[];
}
