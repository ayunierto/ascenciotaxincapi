import { User } from 'src/auth/entities/user.entity';
import { Service } from 'src/services/entities';
import { Staff } from 'src/staff/entities/staff.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { AppointmentState } from '../interfaces/appointment-state.interface';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp with time zone')
  start_date_and_time: Date;

  @Column('timestamp with time zone')
  end_date_and_time: Date;

  @Column('text')
  state: AppointmentState;

  @Column('text')
  comments: string;

  @Column('text')
  additional_remarks: string;

  @Column('timestamp with time zone')
  created_at: string;

  @ManyToOne(() => Service, (service) => service.appointments)
  service: Service;

  @ManyToOne(() => User, (user) => user.appointments)
  user: User;

  @ManyToOne(() => Staff, (staff) => staff.appointments)
  staff: Staff;
}
