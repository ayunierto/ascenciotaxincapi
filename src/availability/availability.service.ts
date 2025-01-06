import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DateTime } from 'luxon';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Between, Repository } from 'typeorm';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async getAvailability(staffId: string, date: string) {
    // Get the day of the week (1-7) 1: Monday
    const weekday = DateTime.fromISO(date).weekday;
    const schedule = await this.scheduleRepository.findOne({
      where: { staff: { id: staffId }, weekday },
    });

    if (!schedule) {
      // throw new BadRequestException('No schedule for this day');
      return []; // There is no schedule for this day
    }

    // Search appointments for the selected day
    // Day Start time
    let currentStartDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.startTime,
      'America/Toronto',
    );

    // If the start time of the day has passed, look for appointments from the current time
    if (currentStartDateTime < new Date()) {
      const now = DateTime.now();
      // Add an hour
      const anHourLater = now.plus({ hours: 1 });

      // Reset minutes and seconds at 0
      const resetTime = anHourLater.set({
        minute: 0,
        second: 0,
        millisecond: 0,
      });
      const ad30minLater = resetTime.plus({ minutes: 30 });

      currentStartDateTime = ad30minLater.toJSDate();
    }

    console.warn(currentStartDateTime);
    // Hora de fin de la jornada
    const scheduleEndDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.endTime,
      'America/Toronto',
    );

    // Find an appointment between the start and end of the selected day
    const appointments = await this.appointmentRepository.find({
      where: {
        staff: { id: staffId },
        startDateAndTime: Between(currentStartDateTime, scheduleEndDateTime),
      }, // Filter by date
      order: { startDateAndTime: 'ASC' },
    });

    const availableSlots = []; // Available slots

    for (const appointment of appointments) {
      const appointmentStartTime = new Date(appointment.startDateAndTime); // Appointment Start Time
      // If there is a space available before the appointment
      if (appointmentStartTime > currentStartDateTime) {
        // Add the available space to the list
        availableSlots.push({
          start: currentStartDateTime.toISOString(),
          end: appointmentStartTime.toISOString(),
        });
      }
      // Update the start time
      currentStartDateTime = new Date(appointment.endDateAndTime);
    }

    // If there is a space available after the last appointment
    if (currentStartDateTime < scheduleEndDateTime) {
      availableSlots.push({
        start: currentStartDateTime.toISOString(),
        end: scheduleEndDateTime.toISOString(),
      });
    }

    return availableSlots;
  }

  /**
   *
   * @param localDate yyyy-MM-dd
   * @param localTime HH:mm:ss
   * @param localTimeZone 'America/New_York'
   * @returns
   */
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
