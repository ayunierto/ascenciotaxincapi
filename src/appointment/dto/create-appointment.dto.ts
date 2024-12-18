import { IsDate, IsObject, IsString } from 'class-validator';
import { Entity } from 'typeorm';
import { AppointmentState } from '../interfaces/appointment-state.interface';
import { Service } from 'src/services/entities';
import { User } from 'src/auth/entities/user.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@Entity()
export class CreateAppointmentDto {
  @IsDate()
  start_date_and_time: Date;

  @IsDate()
  end_date_and_time: Date;

  @IsString()
  state: AppointmentState;

  @IsString()
  comments: string;

  @IsString()
  additional_remarks: string;

  @IsDate()
  created_at: Date;

  @IsObject()
  service: Service;

  @IsObject()
  user: User;

  @IsObject()
  staff: Staff;
}
