import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { User } from '../auth/entities/user.entity';
import { Appointment } from '../appointment/entities/appointment.entity';
import { Service } from '../services/entities/service.entity';
import { Staff } from '../staff/entities/staff.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Appointment, Service, Staff])],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
