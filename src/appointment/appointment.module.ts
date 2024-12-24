import { Module } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentController } from './appointment.controller';
import { Appointment } from './entities/appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from 'src/services/entities';
import { Staff } from 'src/staff/entities/staff.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AppointmentController],
  providers: [AppointmentService],
  imports: [
    TypeOrmModule.forFeature([Appointment, Service, Staff]),
    AuthModule,
  ],
  exports: [AppointmentService, TypeOrmModule],
})
export class AppointmentModule {}
