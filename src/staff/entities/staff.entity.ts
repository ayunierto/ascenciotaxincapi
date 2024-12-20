import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Service } from 'src/services/entities';
import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Staff {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  last_name: string;

  @Column('text', { unique: true })
  email: string;

  @Column('text', { unique: true })
  phone_number: string;

  @Column('timestamp with time zone', { unique: true })
  start_time: Date;

  @Column('timestamp with time zone', { unique: true })
  end_time: Date;

  @Column('bool', {
    default: true,
  })
  is_active: boolean;

  @ManyToMany(() => Service, (service) => service.staff)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.staff)
  appointments: Appointment[];

  // TODO: Agregar user id.
}
