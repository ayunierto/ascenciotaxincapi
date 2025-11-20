import { Module } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { AvailabilityController } from './availability.controller';
import { SettingsModule } from 'src/settings/settings.module';
import { CalendarModule } from 'src/calendar/calendar.module';
import { AppointmentsModule } from 'src/bookings/appointments/appointments.module';
import { StaffMembersModule } from '../staff-members/staff-members.module';
import { ServicesModule } from '../services/services.module';

@Module({
  controllers: [AvailabilityController],
  providers: [AvailabilityService],
  imports: [
    SettingsModule,
    StaffMembersModule,
    ServicesModule,
    CalendarModule,
    AppointmentsModule,
  ],
  exports: [AvailabilityService],
})
export class AvailabilityModule {}
