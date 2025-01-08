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
    const weekday = DateTime.fromISO(date).weekday;
    const schedule = await this.scheduleRepository.findOne({
      where: { staff: { id: staffId }, weekday },
    });

    if (!schedule) return [];

    // Define the start and end dates in the user's time zone
    const startDateTimeUser = DateTime.fromISO(
      `${date}T${schedule.startTime}`,
      { zone: userTimeZone },
    );
    const endDateTimeUser = DateTime.fromISO(`${date}T${schedule.endTime}`, {
      zone: userTimeZone,
    });

    // Convert UTC for comparisons with appointments and events
    const startDateTimeUTC = startDateTimeUser.toUTC();
    const endDateTimeUTC = endDateTimeUser.toUTC();

    const availableSlots: { start: string; end: string }[] = [];

    const nowUTC = DateTime.now().toUTC(); // Hora actual en UTC

    // Iterar por intervalos de una hora
    let currentDateTimeUTC = startDateTimeUTC;

    while (currentDateTimeUTC < endDateTimeUTC) {
      const nextDateTimeUTC = currentDateTimeUTC.plus({ hours: 1 });

      // Verify if the current time has already passed
      if (currentDateTimeUTC < nowUTC) {
        currentDateTimeUTC = nextDateTimeUTC;
        continue;
      }

      const hasAppointment = await this.checkForAppointments(
        staffId,
        currentDateTimeUTC.toJSDate(),
        nextDateTimeUTC.toJSDate(),
      );

      const hasCalendarEvent = await this.checkForEvents(
        currentDateTimeUTC.toJSDate(),
        nextDateTimeUTC.toJSDate(),
      );

      if (!hasAppointment && !hasCalendarEvent) {
        availableSlots.push({
          start: currentDateTimeUTC.toISO(), // Store in ISO 8601 (UTC)
          end: nextDateTimeUTC.toISO(), // Store in ISO 8601 (UTC)
        });
      }

      currentDateTimeUTC = nextDateTimeUTC;
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
}
