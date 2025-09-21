import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Log } from 'src/logs/entities/log.entity';
import { Post } from 'src/blog/posts/entities/post.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Expense } from 'src/accounting/expenses/entities/expense.entity';
import { Report } from 'src/accounting/reports/entities/report.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ type: 'text', nullable: true })
  imageUrl: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ type: 'text', nullable: true })
  countryCode: string;

  @Column({ type: 'text', nullable: true })
  phoneNumber: string;

  @Column({ type: 'text', nullable: true })
  locale: string;

  @Column('bool', { default: true })
  isActive: boolean;

  @Column('text', {
    array: true,
    default: [Role.User],
  })
  roles: Role[];

  @Column('bool', { default: false })
  isEmailVerified: boolean;

  @Column('text', { nullable: true })
  verificationCode: string;

  @Column('timestamp', { nullable: true })
  verificationCodeExpiresAt: Date;

  @Column('text', { nullable: true })
  passwordResetCode: string;

  @Column('timestamp', { nullable: true })
  passwordResetExpiresAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];
}
