import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Service } from 'src/services/entities';
import { Schedule } from 'src/schedule/entities/schedule.entity';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
  imports: [TypeOrmModule.forFeature([Staff, Service, Schedule])],
  exports: [StaffService, TypeOrmModule],
})
export class StaffModule {}
