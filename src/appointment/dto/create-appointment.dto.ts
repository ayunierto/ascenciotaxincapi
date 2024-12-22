import { IsDate, IsObject, IsString } from 'class-validator';
import { Entity } from 'typeorm';
import { AppointmentState } from '../interfaces/appointment-state.interface';
import { Service } from 'src/services/entities';
import { User } from 'src/auth/entities/user.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@Entity()
export class CreateAppointmentDto {
  @IsDate()
  startDateAndTime: Date;

  @IsDate()
  endDateAndTime: Date;

  @IsString()
  state: AppointmentState;

  @IsString()
  comments: string;

  @IsString()
  additionalRemarks: string;

  @IsDate()
  createdAt: Date;

  @IsObject()
  service: Service;

  @IsObject()
  user: User;

  @IsObject()
  staff: Staff;
}
