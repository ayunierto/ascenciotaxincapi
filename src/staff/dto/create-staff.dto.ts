import {
  IsArray,
  IsBoolean,
  IsDate,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';
import { Service } from 'src/services/entities';

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
  last_name: string;

  @IsString()
  @MinLength(3, {
    message: 'The last name must have a minimum of 3 characters',
  })
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(9, {
    message: 'The phone number must have a minimum of 9 characters',
  })
  phone_number: string;

  @IsDate()
  start_time: Date;

  @IsDate()
  end_time: Date;

  @IsBoolean()
  is_active: boolean;

  @IsArray()
  services: Service[];
}
