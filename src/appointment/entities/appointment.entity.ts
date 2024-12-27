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
  startDateAndTime: Date;

  @Column('timestamp with time zone')
  endDateAndTime: Date;

  @Column('text', { default: 'pending' })
  // @Column({
  //   type: 'enum',
  //   enum: ['pending', 'confirmed', 'cancelled', 'completed'],
  //   default: 'pending',
  // })
  state: string;

  @Column('text')
  comments: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @ManyToOne(() => Service, (service) => service.appointments)
  service: Service;

  @ManyToOne(() => User, (user) => user.appointments)
  user: User;

  @ManyToOne(() => Staff, (staff) => staff.appointments)
  staff: Staff;
}
