import { Account } from 'src/accounting/accounts/entities/account.entity';
import { Category } from 'src/accounting/categories/entities/category.entity';
import { Subcategory } from 'src/accounting/subcategories/entities/subcategory.entity';
import { Tag } from 'src/accounting/tags/entities/tag.entity';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column('text')
  merchant: string;

  @Column('timestamp with time zone')
  date: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  total: string;

  @Column('decimal', { precision: 10, scale: 2 })
  tax: string;

  @ManyToOne(() => Category, (category) => category.expenses, { eager: true })
  category: Category;

  @ManyToOne(() => Subcategory, (subcategory) => subcategory.expenses, {
    eager: true,
  })
  subcategory: Subcategory;

  @ManyToOne(() => Account, (account) => account.expenses, { eager: true })
  account: Account;

  @ManyToMany(() => Tag, (tag) => tag.expenses, { eager: true })
  @JoinTable({ name: 'expenses_tags' })
  tags: Tag[];

  @ManyToOne(() => User, (user) => user.expenses)
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
