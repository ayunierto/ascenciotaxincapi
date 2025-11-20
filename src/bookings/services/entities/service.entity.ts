import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Appointment } from 'src/bookings/appointments/entities/appointment.entity';
import { StaffMember } from 'src/bookings/staff-members/entities/staff-member.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ default: '' })
  description: string;

  @Column({ nullable: true })
  address: string;

  @Column('int', { nullable: true })
  durationMinutes: number;

  @Column({ default: true })
  isAvailableOnline: boolean;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date;

  // Relationships
  @ManyToMany(() => StaffMember, (staffMember) => staffMember.services)
  staffMembers: StaffMember[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
