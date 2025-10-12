import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, LessThan, MoreThan, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { DateUtils } from './utils/date.utils';
import { CalendarService } from 'src/calendar/calendar.service';
import { ZoomService } from 'src/zoom/zoom.service';
import { DateTime } from 'luxon';
import { NotificationService } from 'src/notification/notification.service';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { ServicesService } from 'src/services/services.service';
import { StaffService } from 'src/staff/staff.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    // eslint-disable-next-line no-unused-vars
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    // eslint-disable-next-line no-unused-vars
    private readonly scheduleRepository: Repository<Schedule>,

    // eslint-disable-next-line no-unused-vars
    private readonly zoomService: ZoomService,
    // eslint-disable-next-line no-unused-vars
    private readonly calendarService: CalendarService,
    // eslint-disable-next-line no-unused-vars
    private readonly notificationService: NotificationService,
    // eslint-disable-next-line no-unused-vars
    private readonly dateUtils: DateUtils,
    // eslint-disable-next-line no-unused-vars
    private readonly servicesService: ServicesService,
    // eslint-disable-next-line no-unused-vars
    private readonly staffService: StaffService,
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

  async create(createAppointmentDto: CreateAppointmentDto, user: User) {
    try {
      const { staffId, serviceId, utcDateTime, timeZone } =
        createAppointmentDto;

      // Verificar si existe el servicio proporcionado
      const service = await this.servicesService.findOne(serviceId);

      // Check if the staff member exists
      const staff = await this.staffService.findOne(staffId);

      // 2. Obtener el horario del staff para el día seleccionado
      // 0: Sunday, ..., 6: Saturday. Map 0 Sunday
      const dayOfWeek: number =
        DateTime.fromISO(utcDateTime, { zone: 'utc' }).weekday === 7
          ? 0
          : DateTime.fromISO(utcDateTime, { zone: 'utc' }).weekday;

      const schedule = await this.scheduleRepository.findOne({
        where: {
          staff: { id: staffId },
          dayOfWeek,
        },
      });
      if (!schedule) {
        throw new BadRequestException(
          'The staff has no schedule for the selected day. Please verify information.',
        );
      }

      // 3. Establecer fecha y hora del comienzo y fin de la cita
      const startDateAndTime = DateTime.fromISO(utcDateTime, { zone: 'utc' });
      const endDateAndTime = startDateAndTime.plus({ minutes: 59 }); // Add 59 minutes

      // 4. Verificar si la hora seleccionada está dentro del horario laboral
      // 4.1 Establece comienzo y fin de horario segun dia seleccionado
      const startOfSchedule = startDateAndTime.set({
        hour: parseInt(schedule.startTime.split(':')[0]),
        minute: parseInt(schedule.startTime.split(':')[1]),
        second: 0,
        millisecond: 0,
      });
      const endOfSchedule = startDateAndTime.set({
        hour: parseInt(schedule.endTime.split(':')[0]),
        minute: parseInt(schedule.endTime.split(':')[1]),
        second: 0,
        millisecond: 0,
      });

      // 4.2 Retorna un conflicto si la hora de inicio proporcionada en menor a la hora de inicio del horario
      // y si la hora de finalizacion de la cita es mayor que la hora de fin del horario.
      if (startDateAndTime < startOfSchedule) {
        throw new ConflictException(
          `The appointment start time is before staff work hours, staff starts at ${schedule.startTime} and ends at ${schedule.endTime}`,
        );
      }
      if (endDateAndTime > endOfSchedule) {
        throw new ConflictException(
          `The appointment end time is after staff working hours, staff finish at ${schedule.endTime} and start at ${schedule.startTime}`,
        );
      }

      // 5. Verificar si hay solapamiento con citas existentes segun staff seleccionado
      const overlappingAppointment = await this.appointmentsRepository.findOne({
        where: {
          staff: { id: staffId },
          startDateAndTime: LessThan(endDateAndTime.toJSDate()),
          endDateAndTime: MoreThan(startDateAndTime.toJSDate()),
        },
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
        topic: `Appointment: ${service.name}`,
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
        startTime: startDateAndTime.toISO(),
        endTime: endDateAndTime.toISO(),
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
        zoomMeetingId: meeting.id || 'N/A',
        zoomMeetingLink: meeting.join_url || 'N/A',
      });
      await this.appointmentsRepository.save(newAppointment);

      // Send email notifications to staff and customers
      await this.notificationService.sendAppointmentConfirmationEmailToClient(
        user.email,
        {
          serviceName: service.name,
          appointmentDate: startDateAndTime
            .setZone(timeZone)
            .toFormat('yyyy-MM-dd'),
          appointmentTime: startDateAndTime
            .setZone(timeZone)
            .toFormat('HH:mm a'),
          clientName: `${user.firstName} ${user.lastName}`,
          location: service.address,
          staffName: `${staff.firstName} ${staff.lastName}`,
          meetingLink: meeting.join_url,
          clientEmail: user.email,
          clientPhoneNumber: user.phoneNumber || '',
        },
      );

      await this.notificationService.sendAppointmentConfirmationEmailToStaff(
        process.env.EMAIL_USER,
        {
          serviceName: service.name,
          appointmentDate: startDateAndTime
            .setZone('America/Toronto')
            .toFormat('yyyy-MM-dd'),
          appointmentTime: startDateAndTime
            .setZone('America/Toronto')
            .toFormat('HH:mm a'),
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
  ): Promise<Appointment[]> {
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
    checkAvailabilityDto: CheckAvailabilityDto,
    userTimeZone: string = 'America/Toronto',
  ) {
    const { date, staffId } = checkAvailabilityDto;
    const dayOfWeek: number =
      DateTime.fromISO(date).weekday === 7 ? 0 : DateTime.fromISO(date).weekday; // Map Sunday to 7 for Luxon's weekday

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
}
