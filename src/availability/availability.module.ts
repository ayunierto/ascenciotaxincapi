import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';

@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  imports: [TypeOrmModule.forFeature([Appointment, Schedule])],
})
export class AvailabilityModule {}
