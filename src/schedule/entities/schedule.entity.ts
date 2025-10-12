import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Staff } from 'src/staff/entities/staff.entity';
import { Matches } from 'class-validator';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('integer')
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday

  @Column()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Invalid end time format, should be HH:mm',
  })
  startTime: string; // HH:mm

  @Column()
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/, {
    message: 'Invalid end time format, should be HH:mm',
  })
  endTime: string; // HH:mm

  // Relationships
  @ManyToMany(() => Staff, (staff) => staff.schedules)
  staff: Staff[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date;
}
