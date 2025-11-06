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
import { LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { CalendarService } from 'src/calendar/calendar.service';
import { ZoomService } from 'src/zoom/zoom.service';
import { DateTime } from 'luxon';
import { NotificationService } from 'src/notification/notification.service';
import { ServicesService } from 'src/services/services.service';
import { StaffService } from 'src/staff/staff.service';
import { SettingsService } from 'src/settings/settings.service';
import { PaginationDto } from 'src/common/dto/pagination.dto';

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
    console.log({ createAppointmentDto });
    try {
      const { staffId, serviceId, start, end, timeZone, ...rest } =
        createAppointmentDto;

      const settings = await this.settingsService.getSettings();
      if (!settings) {
        throw new BadRequestException('Settings not found');
      }

      // 1. Search requested service.
      const service = await this.servicesService.findOne(serviceId);

      // Check if the staff member exists
      const staff = await this.staffService.findOne(staffId);

      // 2. Get staff schedule for the selected day
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

      // 3. Set appointment start and end date and time
      const startDateAndTime = DateTime.fromISO(start, { zone: 'utc' });
      const endDateAndTime = DateTime.fromISO(end, { zone: 'utc' });

      // 4. Check if the selected time is within working hours
      // 4.1 Set start and end of schedule according to selected day
      // Convertir las horas del horario laboral a la zona horaria de la cita
      const startOfSchedule = startDateAndTime
        .set({
          hour: parseInt(schedule.startTime.split(':')[0]),
          minute: parseInt(schedule.startTime.split(':')[1]),
        })
        .setZone(settings.timeZone, { keepLocalTime: true });

      const endOfSchedule = startDateAndTime
        .set({
          hour: parseInt(schedule.endTime.split(':')[0]),
          minute: parseInt(schedule.endTime.split(':')[1]),
        })
        .setZone(settings.timeZone, { keepLocalTime: true });

      // Registrar información para depuración
      this.logger.debug(`Start of schedule: ${startOfSchedule.toISO()}`);
      this.logger.debug(`End of schedule: ${endOfSchedule.toISO()}`);
      this.logger.debug(`Appointment start: ${startDateAndTime.toISO()}`);
      this.logger.debug(`Appointment end: ${endDateAndTime.toISO()}`);

      // Validar que la cita esté dentro del horario laboral
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

      // 5. Verify if there is an overlap with existing appointments for the selected staff
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
Zoom Meeting: ${meeting.join_url} \n
Staff: ${staff.firstName} ${staff.lastName}\n
Client: ${user.firstName} ${user.lastName}\n
Email: ${user.email}\n
Phone Number: ${user.phoneNumber}\n
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
        ...rest,
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
        process.env.ENTERPRISE_EMAIL,
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
      this.logger.error('Error creating appointment', error.stack);
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const appointments = await this.appointmentsRepository.find({
      take: limit,
      skip: offset,
      relations: {
        staff: true,
        service: true,
        user: true,
      },
      order: {
        id: 'ASC',
      },
    });

    const total = await this.appointmentsRepository.count();

    return {
      count: total,
      pages: Math.ceil(total / limit),
      appointments: appointments,
    };
  }

  async findOne(id: string) {
    return this.appointmentsRepository.findOne({
      where: { id },
      relations: {
        staff: true,
        service: true,
        user: true,
      },
    });
  }

  async update(
    id: string,
    updateAppointmentDto: UpdateAppointmentDto,
    user: User,
  ) {
    try {
      const { staffId, serviceId, start, end, timeZone, ...rest } =
        updateAppointmentDto;

      // Buscar la cita existente
      const appointment = await this.appointmentsRepository.findOne({
        where: { id },
        relations: ['staff', 'service', 'user'],
      });

      if (!appointment) {
        throw new BadRequestException('Appointment not found');
      }

      // Validar el servicio y el personal
      const service = await this.servicesService.findOne(serviceId);
      const staff = await this.staffService.findOne(staffId);

      // Validar el horario del personal
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

      const startDateAndTime = DateTime.fromISO(start, { zone: 'utc' });
      const endDateAndTime = DateTime.fromISO(end, { zone: 'utc' });

      const startOfSchedule = startDateAndTime
        .set({
          hour: parseInt(schedule.startTime.split(':')[0]),
          minute: parseInt(schedule.startTime.split(':')[1]),
        })
        .setZone(timeZone, { keepLocalTime: true });

      const endOfSchedule = startDateAndTime
        .set({
          hour: parseInt(schedule.endTime.split(':')[0]),
          minute: parseInt(schedule.endTime.split(':')[1]),
        })
        .setZone(timeZone, { keepLocalTime: true });

      if (
        startDateAndTime < startOfSchedule ||
        endDateAndTime > endOfSchedule
      ) {
        throw new ConflictException(
          `The appointment time is outside staff working hours: ${schedule.startTime} - ${schedule.endTime}`,
        );
      }

      // Verificar conflictos con otras citas
      const overlappingAppointment = await this.appointmentsRepository.findOne({
        where: {
          staff: { id: staffId },
          id: Not(id), // Excluir la cita actual
          start: LessThan(endDateAndTime.toJSDate()),
          end: MoreThan(startDateAndTime.toJSDate()),
        },
      });

      if (overlappingAppointment) {
        throw new ConflictException(
          'The selected time slot is not available. Please choose another time.',
        );
      }

      // Actualizar la cita
      const updatedAppointment = this.appointmentsRepository.merge(
        appointment,
        {
          staff,
          service,
          start: startDateAndTime,
          end: endDateAndTime,
          ...rest,
        },
      );

      await this.appointmentsRepository.save(updatedAppointment);

      // Actualizar el evento en el calendario
      if (appointment.calendarEventId) {
        await this.calendarService.updateEvent(appointment.calendarEventId, {
          summary: `Appointment: ${service.name}`,
          location: `${service.address}`,
          description: `
Zoom Meeting: ${appointment.zoomMeetingLink} 

Staff: ${staff.firstName} ${staff.lastName}
Client: ${user.firstName} ${user.lastName}
Email: ${user.email}
Phone Number: ${user.phoneNumber}
          `,
          start: {
            dateTime: startDateAndTime.setZone(timeZone).toISO(),
            timeZone: timeZone,
          },
          end: {
            dateTime: endDateAndTime.setZone(timeZone).toISO(),
            timeZone: timeZone,
          },
        });
      }

      return updatedAppointment;
    } catch (error) {
      this.logger.error('Error updating appointment', error.stack);
      throw error;
    }
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
