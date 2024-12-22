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

  @Column('time without time zone')
  startTime: string;

  @Column('time without time zone')
  endTime: string;

  @ManyToOne(() => Staff, (staff) => staff.schedules, { onDelete: 'CASCADE' })
  staff: Staff;
}
