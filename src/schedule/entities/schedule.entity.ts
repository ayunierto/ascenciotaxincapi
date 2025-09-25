import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
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
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday

  @Column()
  startTime: string; // HH:mm

  @Column()
  endTime: string; // HH:mm

  // Relationships
  @ManyToMany(() => Staff, (staff) => staff.schedules)
  staff: Staff[];
}
