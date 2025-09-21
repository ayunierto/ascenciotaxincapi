import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', {
    unique: true,
  })
  name: string;

  @Column('int')
  duration: number;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column('text')
  address: string;

  @Column('bool')
  isAvailableOnline: boolean;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text', {
    nullable: true,
  })
  imageUrl?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToMany(() => Staff, (staff) => staff.services)
  staff: Staff[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
