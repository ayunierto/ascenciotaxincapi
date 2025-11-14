import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Staff } from 'src/staff/entities/staff.entity';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [TypeOrmModule.forFeature([Schedule, Staff])],
  exports: [ScheduleService, TypeOrmModule],
})
export class ScheduleModule {}
