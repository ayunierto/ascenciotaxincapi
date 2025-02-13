import { User } from 'src/auth/entities/user.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('integer')
  weekday: number;

  @Column('time')
  startTime: string;

  @Column('time')
  endTime: string;

  @ManyToOne(() => Staff, (staff) => staff.schedules, { onDelete: 'CASCADE' })
  staff: Staff;

  @ManyToOne((type) => User, (user) => user.schedules, { onDelete: 'CASCADE' })
  user: User;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
