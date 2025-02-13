import { Appointment } from 'src/appointment/entities/appointment.entity';
import { User } from 'src/auth/entities/user.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Service } from 'src/services/entities';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
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
  lastName: string;

  @Column('bool', {
    default: true,
  })
  isActive: boolean;

  @ManyToMany(() => Service, (service) => service.staff, {
    onDelete: 'CASCADE',
  })
  @JoinTable()
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.staff)
  appointments: Appointment[];

  @OneToMany(() => Schedule, (schedule) => schedule.staff)
  schedules: Schedule[];

  @ManyToOne((type) => User, (user) => user.staffs, { onDelete: 'CASCADE' })
  user: User;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
