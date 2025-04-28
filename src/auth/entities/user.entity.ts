import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Service } from '../../services/entities/service.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsOptional } from 'class-validator';
import { Post } from 'src/blog/posts/entities/post.entity';
import { Expense } from 'src/accounting/expenses/entities/expense.entity';
import { Income } from 'src/accounting/incomes/entities/income.entity';
import { Category } from 'src/accounting/categories/entities/category.entity';
import { Subcategory } from 'src/accounting/subcategories/entities/subcategory.entity';
import { Account } from 'src/accounting/accounts/entities/account.entity';
import { AccountType } from 'src/accounting/accounts-types/entities/account-type.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Staff } from 'src/staff/entities/staff.entity';
import { Currency } from 'src/accounting/currencies/entities/currency.entity';
import { Log } from 'src/logs/entities/log.entity';
import { ValidRoles } from '../interfaces';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  name: string;

  @Column('text')
  lastName: string;

  @Column('text', { unique: true })
  email: string;

  @Column('bool', { default: false })
  isEmailVerified: boolean;

  @Column('text', { nullable: true })
  countryCode: string;

  @Column('text', { unique: true, nullable: true })
  phoneNumber: string;

  @Column('text', {})
  password: string;

  @Column('date', { nullable: true })
  birthdate: Date;

  @Column('bool', { default: false })
  isActive: boolean;

  @Column('timestamp with time zone', { nullable: true })
  lastLogin: Date;

  @Column('text', {
    array: true,
    default: ['client'],
  })
  roles: ValidRoles[];

  @Column('text', { nullable: true })
  @IsOptional()
  verificationCode: string;

  @Column('timestamp', { nullable: true })
  @IsOptional()
  verificationCodeExpiresAt: Date;

  @Column('text', { nullable: true })
  @IsOptional()
  passwordResetCode: string;

  @Column('timestamp', { nullable: true })
  @IsOptional()
  passwordResetExpiresAt: Date;

  @OneToMany(() => Service, (service) => service.user)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => AccountType, (accountType) => accountType.user)
  accountsTypes: Account[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Subcategory, (subcategory) => subcategory.user)
  subcategories: Subcategory[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];

  @OneToMany(() => Schedule, (schedule) => schedule.user)
  schedules: Schedule[];

  @OneToMany(() => Staff, (staff) => staff.user)
  staffs: Staff[];

  @OneToMany(() => Income, (income) => income.user)
  incomes: Income[];

  @OneToMany(() => Currency, (currency) => currency.user)
  currencies: Currency[];

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Log, (log) => log.user)
  reports: Log[];

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
