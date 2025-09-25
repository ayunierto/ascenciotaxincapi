import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/services/entities';
import { Between, In, LessThan, MoreThan, Repository } from 'typeorm';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { DateUtils } from './utils/date.utils';
import { CalendarService } from 'src/calendar/calendar.service';
import { ZoomService } from 'src/zoom/zoom.service';
import { DateTime } from 'luxon';
import { NotificationService } from 'src/notification/notification.service';
import { GetCurrentUserAppointmentsResponse } from './interfaces';

@Injectable()
export class AppointmentsService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    private readonly zoomService: ZoomService,
    private readonly calendarService: CalendarService,
    private readonly notificationService: NotificationService,

    private readonly dateUtils: DateUtils,
  ) {}

  /**
   * Converts a time string in the format "HH:MM:SS" to the total number of minutes in the day.
   *
   * @param hour - The time string to convert, in the format "HH:MM:SS".
   * @returns The total number of minutes in the day corresponding to the given time.
   */
  private convertTimeToMinutesOfDay = (time: string): number => {
    const [hours, minutes, second] = time.split(':').map(Number);
    return hours * 60 + minutes + second / 60;
  };

  /**
   * Checks if a given time is within a specified range.
   *
   * @param time - The time to check, in the format "HH:MM:SS".
   * @param startTime - The start time of the range, in the format "HH:MM:SS".
   * @param endTime - The end time of the range, in the format "HH:MM:SS".
   * @returns `true` if the time is within the range, `false` otherwise.
   *
   * If the start time is greater than the end time, the range is considered to
   * cross midnight. In this case, the function will return `true` if the time
   * is either greater than or equal to the start time, or less than or equal to
   * the end time.
   */
  private checkIfTimeIsInRange(
    time: string,
    startTime: string,
    endTime: string,
  ) {
    const timeInMinutes = this.convertTimeToMinutesOfDay(time);
    const startTimeInMinutes = this.convertTimeToMinutesOfDay(startTime);
    const endTimeInMinutes = this.convertTimeToMinutesOfDay(endTime);

    if (startTimeInMinutes > endTimeInMinutes) {
      // Rank crosses midnight
      return (
        timeInMinutes >= startTimeInMinutes || timeInMinutes <= endTimeInMinutes
      );
    }
    return (
      timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes
    );
  }

  async checkAvailabilityOld(
    staffId: string,
    startDateAndTime: Date,
    endDateAndTime: Date,
  ): Promise<boolean> {
    // Get the day of the selected date (1-7) 1: Monday, ..., 7: Sunday
    const startDateTime = startDateAndTime.toISOString();
    const weekday = DateTime.fromISO(startDateTime).weekday;

    // Check if the staff has a defined schedule for that day
    const staffSchedule = await this.scheduleRepository.findOne({
      where: { dayOfWeek: weekday, staff: { id: staffId } },
    });

    // Check if the staff member has a defined schedule for the indicated day
    if (!staffSchedule)
      throw new BadRequestException(
        'The staff member has no work schedule for the selected day',
      );

    const appointmentStartTimeToronto =
      this.dateUtils.convertToIso8601ToToronto(
        new Date(startDateAndTime).toISOString(),
      );
    const appointmentEndTimeToronto = this.dateUtils.convertToIso8601ToToronto(
      new Date(endDateAndTime).toISOString(),
    );
    // Check if the start and end times are the same
    if (appointmentStartTimeToronto === appointmentEndTimeToronto)
      throw new BadRequestException(
        'Selected start and end times are the same',
      );

    const startTimeInRange = this.checkIfTimeIsInRange(
      appointmentStartTimeToronto,
      staffSchedule.startTime,
      staffSchedule.endTime,
    );
    // Comprobar si las horas de inicio y fin estan en el rango de horario establecido
    if (!startTimeInRange)
      throw new BadRequestException(
        'The start time does not match the staff member schedule',
      );
    const endTimeInRange = this.checkIfTimeIsInRange(
      appointmentEndTimeToronto,
      staffSchedule.startTime,
      staffSchedule.endTime,
    );
    if (!endTimeInRange)
      throw new BadRequestException(
        'The end time does not match the staff member schedule',
      );

    const overlappingAppointments = await this.appointmentsRepository.find({
      where: {
        staff: { id: staffId },
        startDateAndTime: In([startDateAndTime, endDateAndTime]),
        endDateAndTime: In([startDateAndTime, endDateAndTime]),
      },
    });

    const conflictingAppointments = await this.appointmentsRepository
      .createQueryBuilder('appointment')
      .where('appointment.staffId = :staffId', { staffId })
      .andWhere(
        '(appointment.startDateAndTime < :endDateAndTime AND appointment.endDateAndTime > :startDateAndTime)',
        { startDateAndTime, endDateAndTime },
      )
      .getMany();

    return (
      overlappingAppointments.length === 0 &&
      conflictingAppointments.length === 0
    );
  }

  async create(createAppointmentDto: CreateAppointmentDto, user: User) {
    try {
      const { staffId, serviceId, date, time, comments, timeZone } =
        createAppointmentDto;

      // Check if the service exists
      const service = await this.serviceRepository.findOneBy({ id: serviceId });
      if (!service) throw new BadRequestException('Service not found');
      const serviceDurationMinutes = service.duration; // Duration in minutes

      // Check if the staff member exists
      const staff = await this.staffRepository.findOneBy({ id: staffId });
      if (!staff) throw new BadRequestException('Staff member not found');

      // 2. Obtener el horario del personal para el día
      const dayOfWeek = DateTime.fromISO(date).weekday;
      const schedule = await this.scheduleRepository.findOne({
        where: {
          staff: { id: staffId },
          dayOfWeek: dayOfWeek === 7 ? 0 : dayOfWeek,
        }, // Map to 0=Domingo
      });
      if (!schedule) {
        throw new NotFoundException(
          'The staff has no schedule for the selected day',
        );
      }

      // 3. Crear objetos de fecha/hora con Luxon y convertir a UTC
      const [startHour, startMinute] = time.split(':').map(Number);
      const startDateLocal = DateTime.fromObject(
        {
          year: Number(date.split('-')[0]), // YYYY
          month: Number(date.split('-')[1]), // MM
          day: Number(date.split('-')[2]), // DD
          hour: startHour,
          minute: startMinute,
        },
        { zone: timeZone },
      );
      const startDateAndTime = startDateLocal.toUTC().toJSDate(); // Convert to UTC Date object
      const endDateAndTime = startDateLocal
        .plus({ minutes: serviceDurationMinutes })
        .toUTC()
        .toJSDate(); // Convert to UTC Date object

      // 4. Verificar si la hora seleccionada está dentro del horario laboral
      const scheduleStartLocal = DateTime.fromISO(
        `${date}T${schedule.startTime}`,
        { zone: timeZone },
      );
      const scheduleEndLocal = DateTime.fromISO(`${date}T${schedule.endTime}`, {
        zone: timeZone,
      });

      if (
        startDateLocal < scheduleStartLocal ||
        startDateLocal.plus({ minutes: serviceDurationMinutes }) >
          scheduleEndLocal
      ) {
        throw new ConflictException(
          'The selected time is outside the staff working hours',
        );
      }

      // 5. Verificar si hay solapamiento con citas existentes
      const overlappingAppointment = await this.appointmentsRepository.findOne({
        where: [
          {
            staff: { id: staffId },
            startDateAndTime: startDateAndTime, // Comprueba si ya existe una cita en ese mismo momento exacto
          },
          {
            staff: { id: staffId },
            startDateAndTime: endDateAndTime,
          },
        ],
      });

      if (overlappingAppointment) {
        throw new ConflictException(
          'The selected time slot is not available. Please choose another time.',
        );
      }

      // Create zoom meeting
      const meeting = await this.zoomService.createZoomMeeting({
        agenda: 'Appointments',
        default_password: false,
        duration: 60,
        password: '123456',
        settings: {
          host_video: true,
          join_before_host: true,
          participant_video: true,
        },
        start_time: startDateAndTime,
        timezone: 'America/Toronto',
        topic: service.name,
        type: 2,
      });

      // Create event in calendar
      const eventId = await this.calendarService.createEvent({
        summary: `Appointment: ${service.name}`,
        description: `
        Zoom Meeting: ${meeting.join_url} 
        Staff: ${staff.firstName} ${staff.lastName}
        Client: ${user.firstName} ${user.lastName}
        Email: ${user.email}
        Phone Number: ${user.phoneNumber}
        `,
        startTime: startDateAndTime.toISOString(),
        endTime: endDateAndTime.toISOString(),
        timeZone: 'America/Toronto',
        location: `${service.address}`,
      });

      // Save appointment
      const newAppointment = this.appointmentsRepository.create({
        user,
        staff,
        service,
        startDateAndTime: startDateAndTime,
        endDateAndTime: endDateAndTime,
        calendarEventId: typeof eventId === 'string' ? eventId : 'N/A',
        zoomMeetingId: meeting.id,
        zoomMeetingLink: meeting.join_url,
      });
      await this.appointmentsRepository.save(newAppointment);

      await this.notificationService.sendAppointmentConfirmationEmailToClient(
        user.email,
        {
          serviceName: service.name,
          appointmentDate: DateTime.fromJSDate(startDateAndTime, {
            zone: 'utc',
          })
            .setZone(timeZone)
            .toFormat('yyyy-MM-dd'),
          appointmentTime: DateTime.fromJSDate(startDateAndTime, {
            zone: 'utc',
          })
            .setZone(timeZone)
            .toFormat('HH:mm:ss'),
          clientName: `${user.firstName} ${user.lastName}`,
          location: service.address,
          staffName: `${staff.firstName} ${staff.lastName}`,
          meetingLink: meeting.join_url,
          clientEmail: user.email,
          clientPhoneNumber: user.phoneNumber || '',
        },
      );

      await this.notificationService.sendAppointmentConfirmationEmailToStaff(
        'ascenciotaxinc@gmail.com',
        {
          serviceName: service.name,
          appointmentDate: DateTime.fromJSDate(startDateAndTime, {
            zone: 'utc',
          })
            .setZone('America/Toronto')
            .toFormat('yyyy-MM-dd'),
          appointmentTime: DateTime.fromJSDate(startDateAndTime, {
            zone: 'utc',
          })
            .setZone('America/Toronto')
            .toFormat('HH:mm:ss'),
          clientName: `${user.firstName} ${user.lastName}`,
          location: service.address,
          staffName: `${staff.firstName} ${staff.lastName}`,
          meetingLink: meeting.join_url,
          clientEmail: user.email,
          clientPhoneNumber: user.phoneNumber,
        },
      );

      return newAppointment;
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    return this.appointmentsRepository.find();
  }

  async findOne(id: string) {
    return this.appointmentsRepository.findOneBy({ id });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    console.log({ updateAppointmentDto });
    return `This action updates a #${id} appointment`;
  }

  async findCurrentUser(
    user: User,
    state: 'pending' | 'past',
  ): Promise<GetCurrentUserAppointmentsResponse> {
    try {
      const now = DateTime.utc().toJSDate();

      if (state === 'pending') {
        const appts = await this.appointmentsRepository.find({
          where: { user: { id: user.id }, startDateAndTime: MoreThan(now) },
          relations: ['staff', 'service'],
        });
        if (!appts) return [];
        return appts;
      }

      if (state === 'past') {
        const appts = await this.appointmentsRepository.find({
          where: { user: { id: user.id }, startDateAndTime: LessThan(now) },
          relations: ['staff', 'service'],
        });
        if (!appts) return [];
        return appts;
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the appointments. Please try again later.',
        'FETCH_APPOINTMENTS_FAILED',
      );
    }
  }

  async remove(id: string) {
    const appointment = await this.appointmentsRepository.findOneBy({ id });
    if (!appointment) throw new BadRequestException('Appointment not found');
    await this.appointmentsRepository.remove(appointment);
    await this.zoomService.remove(appointment.zoomMeetingId);
    await this.calendarService.remove(appointment.calendarEventId);
    return appointment;
  }

  async getAppointmentsByStaffMember(staffMemberId: string, date: string) {
    this.appointmentsRepository.find({
      where: {
        staff: { id: staffMemberId },
        startDateAndTime: Between(
          new Date(`${date}T00:00:00.000Z`),
          new Date(`${date}T23:59:59.999Z`),
        ),
      },
      relations: ['staff_member'],
    });
  }

  async checkAvailability(
    staffId: string,
    date: string,
    userTimeZone: string = 'America/Toronto',
  ) {
    try {
    } catch (error) {}
    const dayOfWeek = DateTime.fromISO(date).weekday;
    const schedule = await this.scheduleRepository.findOne({
      where: { staff: { id: staffId }, dayOfWeek },
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
      (await this.appointmentsRepository.count({
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

  // async checkAvailabilityForTest(
  //   staffId: string,
  //   date: string,
  //   serviceId: string,
  // ): Promise<string[]> {
  //   const service = await this.serviceRepository.findOne({
  //     where: { id: serviceId },
  //   });
  //   if (!service) {
  //     throw new NotFoundException('Servicio no encontrado.');
  //   }

  //   const serviceDuration = service.duration;
  //   const bookingInterval = 15; // Intervalo de reserva, ej. cada 15 minutos

  //   // 1. Obtener el horario de trabajo del personal para el día de la semana
  //   const dayOfWeek = DateTime.fromISO(date).weekday; // Luxon retorna 1=Lunes a 7=Domingo
  //   const schedule = await this.scheduleRepository.findOne({
  //     where: {
  //       staff: { id: staffId },
  //       dayOfWeek: dayOfWeek === 7 ? 0 : dayOfWeek,
  //     }, // Mapea a 0=Domingo
  //   });

  //   if (!schedule) {
  //     return []; // No hay horario de trabajo para este día
  //   }

  //   const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
  //   const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

  //   // 2. Obtener las citas ya agendadas para el staff y la fecha
  //   const dayStart = DateTime.fromISO(date).startOf('day').toJSDate();
  //   const dayEnd = DateTime.fromISO(date).endOf('day').toJSDate();

  //   const existingAppointments = await this.appointmentsRepository.find({
  //     where: {
  //       staff: { id: staffId },
  //       startDateAndTime: Between(dayStart, dayEnd),
  //     },
  //     order: {
  //       startDateAndTime: 'ASC', // Ordenar para un cálculo más fácil
  //     },
  //   });

  //   // 3. Generar todas las franjas de tiempo posibles
  //   const availableSlots = new Set<string>();
  //   let currentTime = DateTime.fromISO(date).set({
  //     hour: startHour,
  //     minute: startMinute,
  //     second: 0,
  //     millisecond: 0,
  //   });
  //   const endTime = DateTime.fromISO(date).set({
  //     hour: endHour,
  //     minute: endMinute,
  //     second: 0,
  //     millisecond: 0,
  //   });

  //   while (currentTime.plus({ minutes: serviceDuration }) <= endTime) {
  //     availableSlots.add(currentTime.toFormat('HH:mm'));
  //     currentTime = currentTime.plus({ minutes: bookingInterval });
  //   }

  //   // 4. Filtrar las franjas de tiempo ocupadas
  //   existingAppointments.forEach((appointment) => {
  //     const apptStart = DateTime.fromJSDate(appointment.startDateAndTime);
  //     const apptEnd = DateTime.fromJSDate(appointment.endDateAndTime);

  //     let occupiedTime = apptStart;
  //     while (occupiedTime < apptEnd) {
  //       availableSlots.delete(occupiedTime.toFormat('HH:mm'));
  //       occupiedTime = occupiedTime.plus({ minutes: bookingInterval });
  //     }
  //   });

  //   return Array.from(availableSlots);
  // }
}
