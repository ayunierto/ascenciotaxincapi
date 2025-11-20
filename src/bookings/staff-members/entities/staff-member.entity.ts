import { Appointment } from 'src/bookings/appointments/entities/appointment.entity';
import { Schedule } from 'src/bookings/schedules/entities/schedule.entity';
import { Service } from 'src/bookings/services/entities';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class StaffMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  firstName: string;

  @Column('text')
  lastName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @ManyToMany(() => Service, (service) => service.staffMembers)
  @JoinTable()
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.staffMember)
  appointments: Appointment[];

  @ManyToMany(() => Schedule, (schedule) => schedule.staffMembers)
  @JoinTable()
  schedules: Schedule[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  deletedAt: Date;
}
