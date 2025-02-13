import { Category } from 'src/accounting/categories/entities/category.entity';
import { Expense } from 'src/accounting/expenses/entities/expense.entity';
import { Income } from 'src/accounting/incomes/entities/income.entity';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'subcategories' })
export class Subcategory {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text', { unique: true })
  name: string;

  @Column('boolean', { default: false })
  isSystem: boolean;

  @ManyToOne(() => Category, (category) => category.subcategories, {
    onDelete: 'CASCADE',
    eager: true,
  })
  category: Category;

  @OneToMany(() => Expense, (expense) => expense.subcategory)
  expenses: Expense[];

  @OneToMany(() => Income, (income) => income.subcategory)
  incomes: Income[];

  @ManyToOne(() => User, (user) => user.subcategories, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    nullable: true,
  })
  updatedAt: Date;
}
