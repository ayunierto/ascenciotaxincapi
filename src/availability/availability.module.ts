import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { SettingsModule } from 'src/settings/settings.module';
import { ServicesModule } from 'src/services/services.module';
import { CalendarModule } from 'src/calendar/calendar.module';
import { AppointmentsModule } from 'src/appointment/appointments.module';
import { StaffModule } from 'src/staff/staff.module';

@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  imports: [
    SettingsModule,
    StaffModule,
    ServicesModule,
    CalendarModule,
    AppointmentsModule,
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
