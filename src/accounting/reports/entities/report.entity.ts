import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('reports')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.reports, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column('timestamp with time zone')
  startDate: Date;

  @Column('timestamp with time zone')
  endDate: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
