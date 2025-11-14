import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { DateUtils } from './utils/date.utils';
import { CalendarModule } from 'src/calendar/calendar.module';
import { ZoomModule } from 'src/zoom/zoom.module';
import { NotificationModule } from 'src/notification/notification.module';
import { ServicesModule } from 'src/services/services.module';
import { StaffModule } from 'src/staff/staff.module';
import { SettingsModule } from 'src/settings/settings.module';

@Module({
  controllers: [AppointmentsController],
  providers: [AppointmentsService, DateUtils],
  imports: [
    TypeOrmModule.forFeature([Appointment, Schedule]),
    AuthModule,
    CalendarModule,
    ZoomModule,
    NotificationModule,
    ServicesModule,
    StaffModule,
    SettingsModule,
  ],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}
