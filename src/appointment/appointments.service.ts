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
import { LessThan, MoreThan, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { CalendarService } from 'src/calendar/calendar.service';
import { ZoomService } from 'src/zoom/zoom.service';
import { DateTime } from 'luxon';
import { NotificationService } from 'src/notification/notification.service';
import { ServicesService } from 'src/services/services.service';
import { StaffService } from 'src/staff/staff.service';
import { SettingsService } from 'src/settings/settings.service';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentsRepository: Repository<Appointment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly zoomService: ZoomService,
    private readonly calendarService: CalendarService,
    private readonly notificationService: NotificationService,
    private readonly servicesService: ServicesService,
    private readonly staffService: StaffService,
    private readonly settingsService: SettingsService,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, user: User) {
    try {
      const { staffId, serviceId, start, end, timeZone } = createAppointmentDto;

      const settings = await this.settingsService.getSettings();
      if (!settings) {
        throw new BadRequestException('Settings not found');
      }

      // 1. Buscar servicio solicitado.
      const service = await this.servicesService.findOne(serviceId);

      // Check if the staff member exists
      const staff = await this.staffService.findOne(staffId);

      // 2. Obtener el horario del staff para el día seleccionado
      // 0: Sunday, ..., 6: Saturday. Map 0 Sunday
      const dayOfWeek: number =
        DateTime.fromISO(start, { zone: 'utc' }).weekday % 7;

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
      const startDateAndTime = DateTime.fromISO(start, { zone: 'utc' });
      const endDateAndTime = DateTime.fromISO(end, { zone: 'utc' });

      // 4. Verificar si la hora seleccionada está dentro del horario laboral
      // 4.1 Establece comienzo y fin de horario segun dia seleccionado
      const startOfSchedule = startDateAndTime.set({
        hour: parseInt(schedule.startTime.split(':')[0]),
        minute: parseInt(schedule.startTime.split(':')[1]),
      });
      const endOfSchedule = startDateAndTime.set({
        hour: parseInt(schedule.endTime.split(':')[0]),
        minute: parseInt(schedule.endTime.split(':')[1]),
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
          start: LessThan(endDateAndTime.toJSDate()),
          end: MoreThan(startDateAndTime.toJSDate()),
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
        start_time: DateTime.fromISO(start, { zone: 'utc' })
          .setZone(timeZone)
          .toISO(),
        timezone: timeZone,
        topic: `Appointment: ${service.name}`,
        type: 2,
      });

      // Create event in calendar
      const eventId = await this.calendarService.createEvent({
        summary: `Appointment: ${service.name}`,
        location: `${service.address}`,
        description: `
          <p>Zoom Meeting: ${meeting.join_url}</p> 
          <p>Staff: ${staff.firstName} ${staff.lastName}</p>
          <p>Client: ${user.firstName} ${user.lastName}</p>
          <p>Email: ${user.email}</p>
          <p>Phone Number: ${user.phoneNumber}</p>
        `,
        start: {
          dateTime: startDateAndTime.setZone(timeZone).toISO(),
          timeZone: timeZone,
        },
        end: {
          dateTime: endDateAndTime.setZone(timeZone).toISO(),
          timeZone: timeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 10 }, // 10 minutes before
          ],
        },
      });

      // Save appointment
      const newAppointment = this.appointmentsRepository.create({
        user,
        staff,
        service,
        start: startDateAndTime,
        end: endDateAndTime,
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
            .setZone(settings.timeZone)
            .toFormat('yyyy-MM-dd'),
          appointmentTime: startDateAndTime
            .setZone(settings.timeZone)
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
      throw new BadRequestException('Could not create appointment');
    }
  }

  async findAll() {
    return this.appointmentsRepository.find();
  }

  async findOne(id: string) {
    return this.appointmentsRepository.findOneBy({ id });
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
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
          where: { user: { id: user.id }, start: MoreThan(now) },
          relations: ['staff', 'service'],
        });
        if (!appts) return [];
        return appts;
      }

      if (state === 'past') {
        const appts = await this.appointmentsRepository.find({
          where: { user: { id: user.id }, start: LessThan(now) },
          relations: ['staff', 'service'],
        });
        if (!appts) return [];
        return appts;
      }
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while fetching the appointments. Please try again later.',
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

  // async getAppointmentsByStaff(staffId: string, date: string) {
  //   this.appointmentsRepository.find({
  //     where: {
  //       staff: { id: staffId },
  //       start: Between(
  //         new Date(`${date}T00:00:00.000Z`),
  //         new Date(`${date}T23:59:59.999Z`),
  //       ),
  //     },
  //     relations: ['staff_member'],
  //   });
  // }
}
