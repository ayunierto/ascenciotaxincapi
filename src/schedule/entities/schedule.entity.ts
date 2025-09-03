import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Staff } from 'src/staff/entities/staff.entity';

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

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Staff, (staff) => staff.schedules, { onDelete: 'CASCADE' })
  staff: Staff;
}
