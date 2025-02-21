import { Account } from 'src/accounting/accounts/entities/account.entity';
import { Category } from 'src/accounting/categories/entities/category.entity';
import { Subcategory } from 'src/accounting/subcategories/entities/subcategory.entity';
import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

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
  image: string;

  @ManyToOne(() => Category, (category) => category.expenses, {
    eager: true,
    onDelete: 'CASCADE',
  })
  category: Category;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.expenses, {
    eager: true,
    onDelete: 'CASCADE',
  })
  subcategory: Subcategory;

  @ManyToOne(() => Account, (account) => account.expenses, {
    eager: true,
    onDelete: 'CASCADE',
  })
  account: Account;

  @ManyToOne(() => User, (user) => user.expenses, { onDelete: 'CASCADE' })
  user: User;

  @Column('text', {
    nullable: true,
  })
  notes: string;

  @Column('timestamp with time zone', {
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column('timestamp with time zone', {
    nullable: true,
  })
  updateAt: Date;
}
