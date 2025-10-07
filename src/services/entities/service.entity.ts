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
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() title_es: string;
  @Column() title_en: string;
  @Column({ default: '' }) description_es: string;
  @Column({ default: '' }) description_en: string;
  @Column() address: string;
  @Column('int') duration_minutes: number;
  @Column({ default: true }) is_online_available: boolean;
  @Column({ nullable: true }) image_url?: string;
  @Column({ default: true }) is_active: boolean;
  @CreateDateColumn() created_at: Date;
  @CreateDateColumn() updated_at: Date;

  // Relationships
  @ManyToMany(() => Staff, (staff) => staff.services)
  staff: Staff[];
  @OneToMany(() => Appointment, (appointment) => appointment.service)
  appointments: Appointment[];
}
