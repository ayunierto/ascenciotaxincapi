import { Plan } from 'src/accounting/plans/entities/plan.entity';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('subscriptions')
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User, (user) => user.subscription)
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions)
  plan: Plan;

  @Column('text', { unique: true })
  name: string;

  @Column('text')
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('timestamp with time zone')
  startDate: Date;

  @Column('timestamp with time zone')
  endDate: Date;

  @Column('text', {
    array: true,
  })
  features: string[];

  @Column('text')
  status: string;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
