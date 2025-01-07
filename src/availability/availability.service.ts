import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { CalendarService } from 'src/calendar/calendar.service';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    private readonly calendarService: CalendarService,
  ) {}

  async getAvailability(
    staffId: string,
    date: string,
    userTimeZone: string = 'America/Toronto',
  ) {
    // Get the day of the week (1-7) 1: Monday
    const weekday = DateTime.fromISO(date).weekday;
    const schedule = await this.scheduleRepository.findOne({
      where: { staff: { id: staffId }, weekday },
    });

    if (!schedule) return [];

    // Day Start time (considering user's time zone)
    // const userTimeZone = 'America/Toronto'; // Replace with user's preferred time zone
    const currentStartDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.startTime,
      userTimeZone,
    );

    // Schedules end time (considering user's time zone)
    const scheduleEndDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.endTime,
      userTimeZone,
    );

    const availableSlots: { start: string; end: string }[] = [];

    // Get the current time in the user's time zone
    const now = DateTime.now().setZone(userTimeZone);

    // Loop through each hour of the schedule
    for (
      let currentHour = currentStartDateTime.getHours();
      currentHour < scheduleEndDateTime.getHours();
      currentHour++
    ) {
      const startTime = new Date(currentStartDateTime);
      startTime.setHours(currentHour); // Set time to the beginning of the hour
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1); // Set time to the end of the hour (next hour)

      // Convert Starttime to the user's time zone
      const startTimeUserTz =
        DateTime.fromJSDate(startTime).setZone(userTimeZone);

      // Jump the iteration if the start time has already passed
      if (startTimeUserTz < now) {
        continue; // Go to the next loop iteration
      }

      // Check for appointments and calendar events in this hour range
      const hasAppointment = await this.checkForAppointments(
        staffId,
        startTime,
        endTime,
      );

      const hasCalendarEvent = await this.checkForEvents(startTime, endTime);

      if (!hasAppointment && !hasCalendarEvent) {
        availableSlots.push({
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        });
      }
    }
    return availableSlots;
  }

  private async checkForAppointments(
    staffId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const appointments =
      (await this.appointmentRepository.count({
        where: {
          staff: { id: staffId },
          startDateAndTime: Between(startDate, endDate),
        },
      })) > 0;

    return appointments; // True if there's at least one appointment
  }

  private async checkForEvents(startTime: Date, endTime: Date) {
    const events = await this.calendarService.checkEventsInRange(
      startTime.toUTCString(),
      endTime.toUTCString(),
    );

    return events.length > 0; // True if there's at least one event
  }

  localDateTimeToUTCFormat(
    localDate: string,
    localTime: string,
    localTimeZone: string,
  ) {
    try {
      // 1. Combine date and time in a single String in ISO 8601 format
      const dateTimeString = `${localDate}T${localTime}`;
      // 2. Create a datetime object with the local time zone
      const localDateTime = DateTime.fromISO(dateTimeString, {
        zone: localTimeZone,
      });
      // 3. Turn UTC
      const UTCDateTime = localDateTime.toUTC();
      // 4. Convert to JavaScript Date
      const UTCDate = UTCDateTime.toJSDate();

      return UTCDate;
    } catch (error) {
      console.error('Conversion error:', error.message);
      return null; // Or launch the error if you prefer to spread
    }
  }
}
