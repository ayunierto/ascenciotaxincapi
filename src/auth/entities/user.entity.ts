import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Appointment } from '../../appointment/entities/appointment.entity';
import { Post } from '../../blog/posts/entities/post.entity';
import { Expense } from '../../accounting/expenses/entities/expense.entity';
import { Income } from '../../accounting/incomes/entities/income.entity';
import { Category } from '../../accounting/categories/entities/category.entity';
import { Subcategory } from '../../accounting/subcategories/entities/subcategory.entity';
import { Account } from '../../accounting/accounts/entities/account.entity';
import { AccountType } from '../../accounting/accounts-types/entities/account-type.entity';
import { Currency } from '../../accounting/currencies/entities/currency.entity';
import { Log } from '../../logs/entities/log.entity';
import { ValidRoles } from '../interfaces';
import { Report } from '../../accounting/reports/entities/report.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  firstName: string;

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
  lastLoginAt: Date;

  @Column('text', {
    array: true,
    default: ['client'],
  })
  roles: ValidRoles[];

  @Column('text', { nullable: true })
  verificationCode: string;

  @Column('timestamp', { nullable: true })
  verificationCodeExpiresAt: Date;

  @Column('text', { nullable: true })
  passwordResetCode: string;

  @Column('timestamp', { nullable: true })
  passwordResetExpiresAt: Date;

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

  @OneToMany(() => Income, (income) => income.user)
  incomes: Income[];

  @OneToMany(() => Currency, (currency) => currency.user)
  currencies: Currency[];

  @OneToMany(() => Log, (log) => log.user)
  logs: Log[];

  @OneToMany(() => Report, (report) => report.user)
  reports: Report[];

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
