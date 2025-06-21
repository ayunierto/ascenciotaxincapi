import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceImage } from './service-image.entity';
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

  @Column('numeric')
  price: number;

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

  @OneToMany(() => ServiceImage, (image) => image.service, {
    cascade: true,
    eager: true,
  })
  images?: ServiceImage[];

  @ManyToMany(() => Staff, (staff) => staff.services, { onDelete: 'CASCADE' })
  staff: Staff[];

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
