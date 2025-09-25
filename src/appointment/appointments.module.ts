import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from 'src/services/entities';
import { Staff } from 'src/staff/entities/staff.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { DateUtils } from './utils/date.utils';
import { CalendarModule } from 'src/calendar/calendar.module';
import { ZoomModule } from 'src/zoom/zoom.module';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, DateUtils],
  imports: [
    TypeOrmModule.forFeature([Appointment, Service, Staff, Schedule]),
    AuthModule,
    CalendarModule,
    ZoomModule,
    NotificationModule,
  ],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}
