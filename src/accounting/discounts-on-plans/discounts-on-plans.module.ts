import { Module } from '@nestjs/common';
import { DiscountsOnPlansService } from './discounts-on-plans.service';
import { DiscountsOnPlansController } from './discounts-on-plans.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscountsOnPlan } from './entities/discounts-on-plan.entity';
import { PlansModule } from '../plans/plans.module';

@Module({
  controllers: [DiscountsOnPlansController],
  providers: [DiscountsOnPlansService],
  imports: [TypeOrmModule.forFeature([DiscountsOnPlan]), PlansModule],
  exports: [TypeOrmModule, DiscountsOnPlansService],
})
export class DiscountsOnPlansModule {}
