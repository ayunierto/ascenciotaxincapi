import { User } from 'src/auth/entities/user.entity';
import { Service } from 'src/services/entities';
import { Staff } from 'src/staff/entities/staff.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Appointment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('timestamp with time zone')
  startDateAndTime: Date;

  @Column('timestamp with time zone')
  endDateAndTime: Date;

  @Column({ default: 'confirmed' })
  // @Column({
  //   type: 'enum',
  //   enum: ['pending', 'confirmed', 'cancelled', 'completed'],
  //   default: 'pending',
  // })
  state: string;

  @Column()
  comments: string;

  @Column()
  calendarEventId: string;

  @Column()
  zoomMeetingId: string;

  @Column({ nullable: true })
  zoomMeetingLink: string;

  @Column({ nullable: true })
  // "enum[app, admin, imported, api]"
  source: string;

  @Column({ nullable: true })
  cancellationReason: string;

  // Relations
  @ManyToOne(() => Service, (service) => service.appointments)
  service: Service;

  @ManyToOne(() => User, (user) => user.appointments, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Staff, (staff) => staff.appointments)
  staff: Staff;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date;
}
