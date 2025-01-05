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
    console.warn('===============================================');
    console.warn('===============================================');
    console.warn({ now: new Date() });
    console.warn({ date });
    // Obtener el día de la semana (1-7) 1: Lunes
    const weekday = DateTime.fromISO(date).weekday;
    console.warn({ weekday });
    const schedule = await this.scheduleRepository.findOne({
      where: { staff: { id: staffId }, weekday },
    });

    if (!schedule) {
      // throw new BadRequestException('No schedule for this day');
      console.warn('No hay horario para este día');
      return []; // No hay horario para este día
    }

    // Buscar citas para el día seleccionado
    // Hora de inicio de la jornada
    let currentStartDateTime = this.createDateTimeISO(date, schedule.startTime);

    // Si ya ha pasado la hora de inicio de la jornada, buscar citas a partir de la hora actual
    if (currentStartDateTime < new Date()) {
      currentStartDateTime = new Date();
    }
    console.warn({ startTime: schedule.startTime });
    console.warn({ currentStartDateTime });
    // Hora de fin de la jornada
    const scheduleEndDateTime = this.createDateTimeISO(date, schedule.endTime);
    console.warn({ endTime: schedule.endTime });
    console.warn({ scheduleEndDateTime });

    // Buscar cita entre el horario de inicio y fin del dia seleccionado
    const appointments = await this.appointmentRepository.find({
      where: {
        staff: { id: staffId },
        startDateAndTime: Between(currentStartDateTime, scheduleEndDateTime),
      }, // Filtrar por fecha
      order: { startDateAndTime: 'ASC' },
    });

    const availableSlots = []; // Espacios disponibles

    for (const appointment of appointments) {
      const appointmentStartTime = new Date(appointment.startDateAndTime); // Hora de inicio de la cita
      // Si hay un espacio disponible antes de la cita
      if (appointmentStartTime > currentStartDateTime) {
        // Agregar el espacio disponible a la lista
        availableSlots.push({
          start: currentStartDateTime.toISOString(),
          end: appointmentStartTime.toISOString(),
        });
      }
      // Actualizar la hora de inicio
      currentStartDateTime = new Date(appointment.endDateAndTime);
    }

    // Si hay un espacio disponible después de la última cita
    if (currentStartDateTime < scheduleEndDateTime) {
      availableSlots.push({
        start: currentStartDateTime.toISOString(),
        end: scheduleEndDateTime.toISOString(),
      });
    }

    console.warn(availableSlots);
    return availableSlots;
  }

  /**
   *
   * @param date "2025-01-20"
   * @param time "09:30:00"
   * @returns "2025-01-20T14:30:00.000Z"
   */
  private createDateTimeISO(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const dateTime = new Date(year, month - 1, day, hours, minutes, seconds);

    return dateTime;
  }
}
