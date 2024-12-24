import { IsDate, IsObject, IsOptional, IsString } from 'class-validator';
import { Entity } from 'typeorm';
import { AppointmentState } from '../interfaces/appointment-state.interface';
import { Service } from 'src/services/entities';
import { User } from 'src/auth/entities/user.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@Entity()
export class CreateAppointmentDto {
  @IsString()
  startDateAndTime: string;

  @IsString()
  endDateAndTime: string;

  @IsString()
  state: string;

  @IsString()
  comments: string;

  @IsString()
  additionalRemarks: string;

  @IsString()
  service: string;

  @IsString()
  staff: string;
}
