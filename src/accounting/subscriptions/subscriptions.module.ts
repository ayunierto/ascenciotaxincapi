import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { Plan } from '../plans/entities/plan.entity';

@Module({
  controllers: [SubscriptionsController],
  imports: [TypeOrmModule.forFeature([Subscription]), Plan],
  providers: [SubscriptionsService],
  exports: [TypeOrmModule, SubscriptionsService],
})
export class SubscriptionsModule {}
