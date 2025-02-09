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
import { Tag } from 'src/accounting/tags/entities/tag.entity';

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

  @Column('text', { unique: true })
  phoneNumber: string;

  @Column('text')
  password: string;

  @Column('date', { nullable: true })
  birthdate: Date;

  @Column('bool', { default: false })
  isActive: boolean;

  @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
  registrationDate: Date;

  @Column('timestamp', { nullable: true })
  lastLogin: Date;

  @Column('text', {
    array: true,
    default: ['client'],
  })
  roles: string[];

  @Column('text', { nullable: true })
  @IsOptional()
  verificationCode: string;

  @OneToMany(() => Service, (service) => service.user)
  services: Service[];

  @OneToMany(() => Appointment, (appointment) => appointment.user)
  appointments: Appointment[];

  @OneToMany(() => Post, (post) => post.user)
  posts: Post[];

  @OneToMany(() => Account, (account) => account.user)
  accounts: Account[];

  @OneToMany(() => Category, (category) => category.user)
  categories: Category[];

  @OneToMany(() => Subcategory, (subcategory) => subcategory.user)
  subcategories: Subcategory[];

  @OneToMany(() => Expense, (expense) => expense.user)
  expenses: Expense[];

  @OneToMany(() => Tag, (tag) => tag.user)
  tags: Tag[];

  @OneToMany(() => Income, (income) => income.user)
  incomes: Income[];
}
