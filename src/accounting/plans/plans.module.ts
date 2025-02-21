import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlansController } from './plans.controller';
import { Plan } from './entities/plan.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [PlansController],
  providers: [PlansService],
  imports: [TypeOrmModule.forFeature([Plan]), AuthModule],
  exports: [TypeOrmModule, PlansService],
})
export class PlansModule {}
