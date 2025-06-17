import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('int')
  duration: number;

  @Column('numeric')
  price: number;

  @Column('text', {
    nullable: true,
  })
  description: string;

  @Column('text', { nullable: true })
  address: string;

  @Column('bool')
  isAvailableOnline: boolean;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @Column('text')
  image: string;

  @ManyToMany(() => Staff, (staff) => staff.services, { onDelete: 'CASCADE' })
  staff: Staff[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
