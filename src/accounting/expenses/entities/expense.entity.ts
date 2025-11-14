import { Category } from 'src/accounting/categories/entities/category.entity';
import { Subcategory } from 'src/accounting/subcategories/entities/subcategory.entity';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  merchant: string;

  @Column('timestamp with time zone')
  date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column('decimal', { precision: 10, scale: 2 })
  tax: number;

  @Column('text', {
    nullable: true,
  })
  imageUrl: string;

  @Column('text', {
    nullable: true,
  })
  notes: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Category, (category) => category.expenses)
  category: Category;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.expenses)
  subcategory: Subcategory;

  @ManyToOne(() => User, (user) => user.expenses, { onDelete: 'CASCADE' })
  user: User;
}
