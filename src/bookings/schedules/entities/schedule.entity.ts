import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Matches } from 'class-validator';
import { StaffMember } from 'src/bookings/staff-members/entities/staff-member.entity';

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
  @ManyToMany(() => StaffMember, (staffMember) => staffMember.schedules)
  staffMembers: StaffMember[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
