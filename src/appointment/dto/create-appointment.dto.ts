import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Entity } from 'typeorm';

@Entity()
export class CreateAppointmentDto {
  @IsNotEmpty()
  @IsDateString()
  startDateAndTime: string;

  @IsNotEmpty()
  @IsDateString()
  endDateAndTime: string;

  @IsString()
  @IsOptional()
  state: string;

  @IsString()
  comments: string;

  @IsString()
  service: string;

  @IsString()
  staff: string;

  // TODO: implementar zona horaria en los eventos y email del  susuario de acorde a su zona
  @IsString()
  @IsOptional()
  timeZone: string;
}
