import { Module } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsController } from './subscriptions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from './entities/subscription.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PlansModule } from '../plans/plans.module';

@Module({
  controllers: [SubscriptionsController],
  imports: [TypeOrmModule.forFeature([Subscription]), AuthModule, PlansModule],
  providers: [SubscriptionsService],
  exports: [TypeOrmModule, SubscriptionsService],
})
export class SubscriptionsModule {}
