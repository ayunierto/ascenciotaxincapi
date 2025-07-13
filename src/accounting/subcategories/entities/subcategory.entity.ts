import { Category } from 'src/accounting/categories/entities/category.entity';
import { Expense } from 'src/accounting/expenses/entities/expense.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'subcategories' })
export class Subcategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text', { unique: true })
  name: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relationships
  @ManyToOne(() => Category, (category) => category.subcategories, {
    onDelete: 'CASCADE',
    eager: true,
  })
  category: Category;

  @OneToMany(() => Expense, (expense) => expense.subcategory)
  expenses: Expense[];
}
