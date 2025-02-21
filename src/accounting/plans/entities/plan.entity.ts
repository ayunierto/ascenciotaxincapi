import { DiscountsOnPlan } from 'src/accounting/discounts-on-plans/entities/discounts-on-plan.entity';
import { Subscription } from 'src/accounting/subscriptions/entities/subscription.entity';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Id del producto en la tienda de aplicaciones (Stripe).
  @Column('text', { unique: true, nullable: true })
  planIdStore: string;

  @Column('text', { unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('text', { array: true })
  features: string[];

  @OneToMany(() => Subscription, (subscription) => subscription.plan)
  subscriptions: Subscription[];

  @OneToMany(() => DiscountsOnPlan, (discount) => discount.plan)
  discounts: DiscountsOnPlan[];

  @ManyToOne(() => User, (user) => user.plans, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
