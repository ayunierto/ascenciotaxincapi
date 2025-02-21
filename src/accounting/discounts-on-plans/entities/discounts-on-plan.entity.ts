import { Plan } from 'src/accounting/plans/entities/plan.entity';
import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class DiscountsOnPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  months: number;

  @Column('int')
  discount: number;

  @ManyToOne(() => User, (user) => user.discounts, {
    onDelete: 'CASCADE',
  })
  user: User;

  @ManyToOne(() => Plan, (plan) => plan.discounts)
  plan: Plan;

  @Column('timestamp with time zone', { default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column('timestamp with time zone', { nullable: true })
  updatedAt: Date;
}
