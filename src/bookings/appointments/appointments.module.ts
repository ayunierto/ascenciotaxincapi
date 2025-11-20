import { Module } from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { AppointmentsController } from './appointments.controller';
import { Appointment } from './entities/appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { DateUtils } from './utils/date.utils';
import { CalendarModule } from 'src/calendar/calendar.module';
import { ZoomModule } from 'src/zoom/zoom.module';
import { NotificationModule } from 'src/notification/notification.module';
import { SettingsModule } from 'src/settings/settings.module';
import { Schedule } from '../schedules/entities/schedule.entity';
import { StaffMembersModule } from '../staff-members/staff-members.module';
import { ServicesModule } from '../services/services.module';

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
    StaffMembersModule,
    SettingsModule,
  ],
  exports: [AppointmentsService, TypeOrmModule],
})
export class AppointmentsModule {}
