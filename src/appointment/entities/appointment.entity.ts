import { User } from 'src/auth/entities/user.entity';
import { Service } from 'src/services/entities';
import { Staff } from 'src/staff/entities/staff.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column('text')
  calendarEventId: string;

  @Column('text')
  zoomMeetingId: string;

  @Column('text', { nullable: true })
  zoomMeetingLink: string;

  @ManyToOne(() => User, (user) => user.appointments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Service, (service) => service.appointments)
  service: Service;

  @ManyToOne(() => Staff, (staff) => staff.appointments)
  staff: Staff;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
