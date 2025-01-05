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
    let currentStartDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.startTime,
      'America/Toronto',
    );

    // Si ya ha pasado la hora de inicio de la jornada, buscar citas a partir de la hora actual
    if (currentStartDateTime < new Date()) {
      currentStartDateTime = new Date();
    }
    console.warn({ startTime: schedule.startTime });
    console.warn({ currentStartDateTime });
    // Hora de fin de la jornada
    const scheduleEndDateTime = this.localDateTimeToUTCFormat(
      date,
      schedule.endTime,
      'America/Toronto',
    );
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
      // 1. Crear un objeto DateTime a partir de la fecha, hora y zona horaria local.
      const fechaHoraLocalStr = `${localDate} ${localTime}`;
      const fechalocalTime = DateTime.fromFormat(
        fechaHoraLocalStr,
        'yyyy-MM-dd HH:mm:ss',
        { zone: localTimeZone },
      );

      // 2. Verificar si la fecha y hora local son válidas.
      if (!fechalocalTime.isValid) {
        throw new Error(
          `CLOSE Y INVALID LOCAL TIME: ${fechalocalTime.invalidReason}`,
        );
      }

      // 3. Convertir a UTC.
      const fechaHoraUtc = fechalocalTime.toUTC();

      // 4. Formatear a ISO 8601 con milisegundos y la 'Z' final para indicar UTC.
      const fechaHoraUtcFormateada = fechaHoraUtc.toISO({
        // includeOffset: false,
      });
      console.warn({ fechaHoraUtcFormateada });

      return new Date(fechaHoraUtcFormateada);
    } catch (error) {
      console.error('Conversion error:', error.message);
      return null; // O lanzar el error si prefieres que se propague
    }
  }
}
