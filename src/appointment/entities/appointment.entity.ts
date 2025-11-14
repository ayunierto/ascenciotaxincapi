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
  start: Date;

  @Column('timestamp with time zone')
  end: Date;

  @Column()
  timeZone: string;

  @Column({ default: 'confirmed' })
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

  @Column({ nullable: true })
  comments: string;

  @Column()
  calendarEventId: string;

  @Column()
  zoomMeetingId: string;

  @Column({ nullable: true })
  zoomMeetingLink: string;

  @Column({ default: 'app' })
  // "enum[app, admin, imported, api]"
  source: 'app' | 'admin' | 'imported' | 'api';

  @Column({ nullable: true })
  cancellationReason?: string;

  @Column({ nullable: true })
  cancelledAt?: Date; // Timestamp de cuándo se canceló

  @Column({ nullable: true })
  cancelledBy?: string; // 'user' | 'staff' | 'admin'


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
