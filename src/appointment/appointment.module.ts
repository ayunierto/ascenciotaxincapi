import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService],
  imports: [TypeOrmModule.forFeature([Appointment])],
  exports: [AppointmentService, TypeOrmModule],
})
export class AppointmentModule {}
