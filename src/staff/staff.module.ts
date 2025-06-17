import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Service } from 'src/services/entities/service.entity';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
  imports: [TypeOrmModule.forFeature([Staff, Service, Schedule])],
  exports: [StaffService],
})
export class StaffModule {}
