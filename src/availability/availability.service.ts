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
    console.warn({ weekday });
    const schedule = await this.scheduleRepository.findOne({
      where: { staff: { id: staffId }, weekday },
    });
    console.warn({ schedule });

    if (!schedule) return [];

    // Day Start time (considering user's time zone)
    // const userTimeZone = 'America/Toronto'; // Replace with user's preferred time zone
    const currentStartDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.startTime,
      userTimeZone,
    );
    console.warn({ currentStartDateTime });

    // Schedules end time (considering user's time zone)
    const scheduleEndDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.endTime,
      userTimeZone,
    );
    console.warn({ scheduleEndDateTime });

    const availableSlots: { start: string; end: string }[] = [];
    console.warn({ availableSlots });
    console.warn('=======================');

    // Loop through each hour of the schedule
    for (
      let currentHour = currentStartDateTime.getHours();
      currentHour < scheduleEndDateTime.getHours();
      currentHour++
    ) {
      console.warn({ currentHour });
      const startTime = new Date(currentStartDateTime);
      startTime.setHours(currentHour); // Set time to the beginning of the hour
      console.warn({ startTime });
      const endTime = new Date(startTime);
      endTime.setHours(startTime.getHours() + 1); // Set time to the end of the hour (next hour)
      console.warn({ endTime });

      // Check for appointments and calendar events in this hour range
      const hasAppointment = await this.checkForAppointments(
        staffId,
        startTime,
        endTime,
      );
      console.warn({ hasAppointment });

      const hasCalendarEvent = await this.checkForEvents(startTime, endTime);
      console.warn({ hasCalendarEvent });

      if (!hasAppointment && !hasCalendarEvent) {
        availableSlots.push({
          start: startTime.toISOString(),
          end: endTime.toISOString(),
        });
      }
    }
    console.warn({ availableSlots });
    return availableSlots;

    // // If the start time of the day has passed, look for appointments from the current time
    // if (currentStartDateTime < new Date()) {
    //   const now = DateTime.now();
    //   // Add an hour
    //   const anHourLater = now.plus({ hours: 1 });

    //   // Reset minutes and seconds at 0
    //   const resetTime = anHourLater.set({
    //     minute: 0,
    //     second: 0,
    //     millisecond: 0,
    //   });
    //   const ad30minLater = resetTime.plus({ minutes: 30 });

    //   currentStartDateTime = ad30minLater;
    // }

    // // Search an appointment between the start and end of the selected day
    // const appointments = await this.appointmentRepository.find({
    //   where: {
    //     staff: { id: staffId },
    //     startDateAndTime: Between(currentStartDateTime, scheduleEndDateTime),
    //   }, // Filter by date
    //   order: { startDateAndTime: 'ASC' },
    // });
    // for (const appointment of appointments) {
    //   // Appointment Start Time
    //   const appointmentStartTime = new Date(appointment.startDateAndTime);

    //   // If there is a space available before the appointment
    //   if (appointmentStartTime > currentStartDateTime) {
    //     const events = await this.calendarService.checkEventsInRange(
    //       currentStartDateTime.toUTCString(),
    //       appointmentStartTime.toUTCString(),
    //     );
    //     console.warn({ beforeAppointment: events });

    //     // Add the available space to the list
    //     availableSlots.push({
    //       start: currentStartDateTime.toISOString(),
    //       end: appointmentStartTime.toISOString(),
    //     });
    //   }
    //   // Update the start time
    //   currentStartDateTime = new Date(appointment.endDateAndTime);
    // }

    // // If there is a space available after the last appointment
    // if (currentStartDateTime < scheduleEndDateTime) {
    //   const events = await this.calendarService.checkEventsInRange(
    //     currentStartDateTime.toUTCString(),
    //     scheduleEndDateTime.toUTCString(),
    //   );
    //   console.warn({ afterAppointment: events });
    //   availableSlots.push({
    //     start: currentStartDateTime.toISOString(),
    //     end: scheduleEndDateTime.toISOString(),
    //   });
    // }

    // return availableSlots;
  }

  private async checkForAppointments(
    staffId: string,
    startDate: Date,
    endDate: Date,
  ) {
    const appointments = await this.appointmentRepository.find({
      where: {
        staff: { id: staffId },
        startDateAndTime: Between(startDate, endDate),
      },
    });

    return appointments.length > 0; // True if there's at least one appointment
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
