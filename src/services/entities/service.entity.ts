import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ServiceImage } from './service-image.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Entity()
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

  @Column('bool')
  is_available_online: boolean;

  @Column('bool', {
    default: true,
  })
  is_active: boolean;

  @OneToMany(() => ServiceImage, (image) => image.service, {
    cascade: true,
    eager: true,
  })
  images?: ServiceImage[];

  @ManyToMany(() => Staff, (staff) => staff.services)
  @JoinTable()
  staff: Staff[];

  @ManyToOne(() => User, (user) => user.services, { eager: true })
  user: User;

  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
