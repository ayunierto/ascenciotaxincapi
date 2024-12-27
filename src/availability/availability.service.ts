import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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

  async getAvailability(staffMemberId: string, date: string) {
    const dateISO = new Date(date).toISOString();
    const weekday = new Date(dateISO).getDay(); // Obtener el día de la semana (0-6)
    const schedule = await this.scheduleRepository.findOne({
      where: { staff: { id: staffMemberId }, weekday: weekday },
    });

    if (!schedule) {
      // throw new BadRequestException('No schedule for this day');
      return []; // No hay horario para este día
    }

    // Buscar citas para el día seleccionado
    const appointments = await this.appointmentRepository.find({
      where: {
        staff: { id: staffMemberId },
        startDateAndTime: Between(
          new Date(`${date}T00:00:00.000Z`),
          new Date(`${date}T23:59:59.999Z`),
        ),
      }, // Filtrar por fecha
      order: { startDateAndTime: 'ASC' },
    });

    const availableSlots = []; // Espacios disponibles
    let currentStartTime = this.createDateTime(date, schedule.startTime); // Hora de inicio de la jornada
    const scheduleEndTime = this.createDateTime(date, schedule.endTime); // Hora de fin de la jornada

    for (const appointment of appointments) {
      const appointmentStartTime = new Date(appointment.startDateAndTime); // Hora de inicio de la cita
      // Si hay un espacio disponible antes de la cita
      if (appointmentStartTime > currentStartTime) {
        // Agregar el espacio disponible a la lista
        availableSlots.push({
          start: currentStartTime.toISOString(),
          end: appointmentStartTime.toISOString(),
        });
      }
      currentStartTime = new Date(appointment.endDateAndTime); // Actualizar la hora de inicio
    }

    // Si hay un espacio disponible después de la última cita
    if (currentStartTime < scheduleEndTime) {
      availableSlots.push({
        start: currentStartTime.toISOString(),
        end: scheduleEndTime.toISOString(),
      });
    }

    return availableSlots;
  }

  private createDateTime(date: string, time: string): Date {
    const [year, month, day] = date.split('-').map(Number);
    const [hours, minutes, seconds] = time.split(':').map(Number);

    const dateTime = new Date(year, month - 1, day, hours, minutes, seconds);

    return dateTime;
  }
}
