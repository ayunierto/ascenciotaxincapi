import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Service } from '../../services/entities/service.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User {
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

  @Column('text', { select: false })
  password: string;

  @Column('date', { nullable: true })
  birthdate: Date;

  @Column('bool', { default: false })
  is_active: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  registration_date: Date;

  @Column('timestamp', { nullable: true })
  last_login: Date;

  @Column('text', {
    array: true,
    default: ['user'],
  })
  roles: string[];

  @OneToMany(() => Service, (service) => service.user)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];
}
