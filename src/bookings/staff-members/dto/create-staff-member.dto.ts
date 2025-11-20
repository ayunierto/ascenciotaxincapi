import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateStaffMemberDto {
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

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  services?: string[];

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  schedules?: string[];
}
