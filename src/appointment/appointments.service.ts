import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { In, LessThan, MoreThan, Not, Repository } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { CalendarService } from 'src/calendar/calendar.service';
import { ZoomService } from 'src/zoom/zoom.service';
import { DateTime } from 'luxon';
import { NotificationService } from 'src/notification/notification.service';
import { ServicesService } from 'src/services/services.service';
import { StaffService } from 'src/staff/staff.service';
import { SettingsService } from 'src/settings/settings.service';
import {
  formatAppointmentDescription,
  getZoomMeetingConfig,
  validateWorkingHours,
  validateDatesForUpdate,
  validateTimeZone,
} from './utils/appointment.utils';
import { AppointmentHelper } from './helpers/appointment.helper';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';

@Injectable()
export class AppointmentsService {
  private readonly logger = new Logger(AppointmentsService.name);

  private readonly appointmentHelper: AppointmentHelper;

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
  ) {
    this.appointmentHelper = new AppointmentHelper(
      this.scheduleRepository,
      this.staffService,
      this.servicesService,
    );
  }

  async create(createAppointmentDto: CreateAppointmentDto, user: User) {
    try {
      const { staffId, serviceId, start, end, timeZone, ...rest } =
        createAppointmentDto;

      const settings = await this.settingsService.getSettings();
      if (!settings) {
        throw new BadRequestException('Settings not found');
      }

      // Validar la zona horaria
      const validatedTimeZone = validateTimeZone(timeZone);

      // 1. Obtener servicio y personal
      const { service, staff } =
        await this.appointmentHelper.getServiceAndStaff(serviceId, staffId);

      // 2. Set appointment start and end date and time
      const startDateAndTime = DateTime.fromISO(start, { zone: 'utc' });
      const endDateAndTime = DateTime.fromISO(end, { zone: 'utc' });

      // Validar fechas
      validateDatesForUpdate(startDateAndTime, endDateAndTime, null, null);

      // 3. Validar horario y obtener schedule
      const schedule = await this.appointmentHelper.validateAndGetSchedule(
        staffId,
        startDateAndTime,
      );

      // 4. Validar horas laborales
      validateWorkingHours(
        schedule,
        startDateAndTime,
        endDateAndTime,
        validatedTimeZone,
      );

      // 5. Verificar conflictos con otras citas
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

      // 6. Crear reunión de Zoom
      const meeting = await this.zoomService.createZoomMeeting(
        getZoomMeetingConfig(
          service.name,
          startDateAndTime.setZone(validatedTimeZone).toISO(),
          validatedTimeZone,
        ),
      );

      // 7. Crear evento en el calendario
      const eventId = await this.calendarService.createEvent({
        summary: `Appointment: ${service.name}`,
        location: service.address,
        description: formatAppointmentDescription(
          meeting.join_url,
          staff.firstName,
          staff.lastName,
          user.firstName,
          user.lastName,
          user.email,
          user.phoneNumber || '',
        ),
        start: {
          dateTime: startDateAndTime.setZone(validatedTimeZone).toISO(),
          timeZone: validatedTimeZone,
        },
        end: {
          dateTime: endDateAndTime.setZone(validatedTimeZone).toISO(),
          timeZone: validatedTimeZone,
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 10 },
          ],
        },
      });

      // 8. Guardar la cita
      const newAppointment = this.appointmentsRepository.create({
        user,
        staff,
        service,
        start: startDateAndTime,
        end: endDateAndTime,
        timeZone: validatedTimeZone,
        calendarEventId: typeof eventId === 'string' ? eventId : 'N/A',
        zoomMeetingId: meeting.id || 'N/A',
        zoomMeetingLink: meeting.join_url || 'N/A',
        ...rest,
      });
      await this.appointmentsRepository.save(newAppointment);

      // 9. Enviar notificaciones
      await this.notificationService.sendAppointmentConfirmationEmailToClient(
        user.email,
        {
          serviceName: service.name,
          appointmentDate: startDateAndTime
            .setZone(validatedTimeZone)
            .toFormat('yyyy-MM-dd'),
          appointmentTime: startDateAndTime
            .setZone(validatedTimeZone)
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
          clientPhoneNumber: user.phoneNumber || '',
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
      const settings = await this.settingsService.getSettings();
      if (!settings) {
        throw new BadRequestException('Settings not found');
      }

      // 1. Buscar la cita existente
      const appointment = await this.appointmentsRepository.findOne({
        where: { id },
        relations: ['staff', 'service', 'user'],
      });

      if (!appointment) {
        throw new BadRequestException('Appointment not found');
      }

      const { staffId, serviceId, start, end, timeZone, ...rest } =
        updateAppointmentDto;
      const appointmentTimeZone = validateTimeZone(
        timeZone || appointment.timeZone,
      );

      // 2. Obtener servicio y personal actualizado usando el helper
      const { service, staff } =
        await this.appointmentHelper.getServiceAndStaff(
          serviceId,
          staffId,
          appointment.service,
          appointment.staff,
        );

      // 3. Si se actualizan las fechas, validar disponibilidad
      if (start && end) {
        this.logger.log(
          `Received start: ${start}, end: ${end}, timeZone: ${timeZone}`,
        );

        const startDateAndTime = DateTime.fromISO(start, { zone: 'utc' });
        const endDateAndTime = DateTime.fromISO(end, { zone: 'utc' });

        this.logger.log(
          `Parsed startDateAndTime (UTC): ${startDateAndTime.toISO()}`,
        );
        this.logger.log(
          `Parsed endDateAndTime (UTC): ${endDateAndTime.toISO()}`,
        );
        this.logger.log(`appointmentTimeZone: ${appointmentTimeZone}`);

        // Log de las fechas en la zona horaria objetivo
        this.logger.log(
          `Start in target timezone: ${startDateAndTime.setZone(appointmentTimeZone).toISO()}`,
        );
        this.logger.log(
          `End in target timezone: ${endDateAndTime.setZone(appointmentTimeZone).toISO()}`,
        );

        // Validar fechas
        validateDatesForUpdate(
          startDateAndTime,
          endDateAndTime,
          DateTime.fromJSDate(appointment.start),
          DateTime.fromJSDate(appointment.end),
        );

        // Validar horario del personal y obtener schedule
        const schedule = await this.appointmentHelper.validateAndGetSchedule(
          staff.id,
          startDateAndTime,
        );

        // Validar horas laborales
        validateWorkingHours(
          schedule,
          startDateAndTime,
          endDateAndTime,
          appointmentTimeZone,
        );

        // Verificar conflictos con otras citas
        const overlappingAppointment =
          await this.appointmentsRepository.findOne({
            where: {
              staff: { id: staff.id },
              id: Not(id),
              start: LessThan(endDateAndTime.toJSDate()),
              end: MoreThan(startDateAndTime.toJSDate()),
            },
          });

        if (overlappingAppointment) {
          throw new ConflictException(
            'The selected time slot is not available. Please choose another time.',
          );
        }

        // 4. Actualizar servicios externos (Zoom y Calendar)
        await this.appointmentHelper.updateExternalServices(
          this.zoomService,
          this.calendarService,
          appointment,
          {
            startDateAndTime,
            endDateAndTime,
            timeZone: appointmentTimeZone,
            serviceName: service.name,
            serviceAddress: service.address,
            staffName: {
              firstName: staff.firstName,
              lastName: staff.lastName,
            },
            userName: {
              firstName: user.firstName,
              lastName: user.lastName,
            },
            userEmail: user.email,
            userPhoneNumber: user.phoneNumber,
          },
        );

        // 4.1 Fallback: crear recursos externos si faltan IDs válidos
        if (
          !appointment.calendarEventId ||
          appointment.calendarEventId === 'N/A'
        ) {
          const newEventId = await this.calendarService.createEvent({
            summary: `Appointment: ${service.name}`,
            location: service.address,
            description: formatAppointmentDescription(
              appointment.zoomMeetingLink,
              staff.firstName,
              staff.lastName,
              user.firstName,
              user.lastName,
              user.email,
              user.phoneNumber || '',
            ),
            start: {
              dateTime: startDateAndTime.setZone(appointmentTimeZone).toISO(),
              timeZone: appointmentTimeZone,
            },
            end: {
              dateTime: endDateAndTime.setZone(appointmentTimeZone).toISO(),
              timeZone: appointmentTimeZone,
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
              ],
            },
          });
          appointment.calendarEventId =
            typeof newEventId === 'string' ? newEventId : 'N/A';
        }

        if (!appointment.zoomMeetingId || appointment.zoomMeetingId === 'N/A') {
          const meeting = await this.zoomService.createZoomMeeting(
            getZoomMeetingConfig(
              service.name,
              startDateAndTime.setZone(appointmentTimeZone).toISO(),
              appointmentTimeZone,
            ),
          );
          appointment.zoomMeetingId = meeting.id || 'N/A';
          appointment.zoomMeetingLink = meeting.join_url || 'N/A';
        }

        // 5. Actualizar la cita
        const updatedAppointment = this.appointmentsRepository.merge(
          appointment,
          {
            staff,
            service,
            start: startDateAndTime.toJSDate(),
            end: endDateAndTime.toJSDate(),
            timeZone: appointmentTimeZone,
            ...rest,
          },
        );

        await this.appointmentsRepository.save(updatedAppointment);
        return updatedAppointment;
      } else {
        // Si no se actualizan las fechas, actualizar otros campos y también sincronizar servicios externos
        const startDateAndTime = DateTime.fromJSDate(appointment.start, {
          zone: 'utc',
        });
        const endDateAndTime = DateTime.fromJSDate(appointment.end, {
          zone: 'utc',
        });

        // Actualizar servicios externos (título, ubicación, descripción) aunque el horario no cambie
        await this.appointmentHelper.updateExternalServices(
          this.zoomService,
          this.calendarService,
          appointment,
          {
            startDateAndTime,
            endDateAndTime,
            timeZone: appointmentTimeZone,
            serviceName: service.name,
            serviceAddress: service.address,
            staffName: {
              firstName: staff.firstName,
              lastName: staff.lastName,
            },
            userName: {
              firstName: user.firstName,
              lastName: user.lastName,
            },
            userEmail: user.email,
            userPhoneNumber: user.phoneNumber,
          },
        );

        // Fallback: crear recursos externos si faltan IDs válidos
        if (
          !appointment.calendarEventId ||
          appointment.calendarEventId === 'N/A'
        ) {
          const newEventId = await this.calendarService.createEvent({
            summary: `Appointment: ${service.name}`,
            location: service.address,
            description: formatAppointmentDescription(
              appointment.zoomMeetingLink,
              staff.firstName,
              staff.lastName,
              user.firstName,
              user.lastName,
              user.email,
              user.phoneNumber || '',
            ),
            start: {
              dateTime: startDateAndTime.setZone(appointmentTimeZone).toISO(),
              timeZone: appointmentTimeZone,
            },
            end: {
              dateTime: endDateAndTime.setZone(appointmentTimeZone).toISO(),
              timeZone: appointmentTimeZone,
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 10 },
              ],
            },
          });
          appointment.calendarEventId =
            typeof newEventId === 'string' ? newEventId : 'N/A';
        }

        if (!appointment.zoomMeetingId || appointment.zoomMeetingId === 'N/A') {
          const meeting = await this.zoomService.createZoomMeeting(
            getZoomMeetingConfig(
              service.name,
              startDateAndTime.setZone(appointmentTimeZone).toISO(),
              appointmentTimeZone,
            ),
          );
          appointment.zoomMeetingId = meeting.id || 'N/A';
          appointment.zoomMeetingLink = meeting.join_url || 'N/A';
        }

        const updatedAppointment = this.appointmentsRepository.merge(
          appointment,
          {
            staff,
            service,
            ...rest,
          },
        );

        await this.appointmentsRepository.save(updatedAppointment);
        return updatedAppointment;
      }
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

  async cancelAppointment(
    appointmentId: string,
    userId: string,
    cancelDto: CancelAppointmentDto,
  ): Promise<Appointment> {
    // 1. Buscar la cita
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: {
        user: true,
        service: true,
        staff: true,
      }, // Ajusta según tus relaciones
    });

    if (!appointment) {
      throw new NotFoundException(
        `Appointment with ID ${appointmentId} not found`,
      );
    }

    // 2. Verificar que el usuario es el dueño de la cita
    if (appointment.user.id !== userId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    // 3. Verificar que la cita no esté ya cancelada
    if (appointment.status === 'cancelled') {
      throw new BadRequestException('This appointment is already cancelled');
    }

    // 4. Verificar que la cita no esté completada
    if (appointment.status === 'completed') {
      throw new BadRequestException('Cannot cancel a completed appointment');
    }

    // 5. Opcional: Verificar tiempo mínimo de cancelación (ej: 24 horas antes)
    const now = new Date();
    const appointmentStart = new Date(appointment.start);
    const hoursUntilAppointment =
      (appointmentStart.getTime() - now.getTime()) / (1000 * 60 * 60); // Convertir a horas

    if (hoursUntilAppointment < 24) {
      // Puedes lanzar excepción o permitirlo con una nota
      throw new BadRequestException(
        'Appointments must be cancelled at least 24 hours in advance. Please contact support for assistance.',
      );
    }

    // 6. Actualizar la cita
    appointment.status = 'cancelled';
    appointment.cancellationReason = cancelDto.cancellationReason;
    appointment.cancelledAt = new Date();

    const cancelledAppointment =
      await this.appointmentsRepository.save(appointment);

    // 7. Opcional: Enviar notificación por email
    await this.notificationService.sendCancellationEmail({
      appointmentDate: DateTime.fromJSDate(appointment.start)
        .setZone(appointment.timeZone)
        .toFormat('yyyy-MM-dd'),
      appointmentTime: DateTime.fromJSDate(appointment.start)
        .setZone(appointment.timeZone)
        .toFormat('hh:mm a'),
      clientName: appointment.user.firstName + ' ' + appointment.user.lastName,
      clientEmail: appointment.user.email,
      staffName: appointment.staff.firstName + ' ' + appointment.staff.lastName,
      serviceName: appointment.service.name,
      clientPhoneNumber: appointment.user.phoneNumber || '',
      location: appointment.service.address || '',
      meetingLink: appointment.zoomMeetingLink || '',
    });

    // 8. Opcional: Registrar en log/auditoría
    // await this.logsService.logAppointmentCancellation(appointment, userId);

    // 9. Remove calendar event and zoom meeting
    await this.calendarService.remove(appointment.calendarEventId);
    await this.zoomService.remove(appointment.zoomMeetingId);

    return cancelledAppointment;
  }

  // Método auxiliar para verificar si se puede cancelar
  async canCancelAppointment(
    appointmentId: string,
    userId: string,
  ): Promise<boolean> {
    const appointment = await this.appointmentsRepository.findOne({
      where: { id: appointmentId },
      relations: { user: true },
    });

    if (!appointment) return false;
    if (appointment.user.id !== userId) return false;
    if (appointment.status !== 'confirmed') return false;

    const now = new Date();
    const appointmentStart = new Date(appointment.start);
    const hoursUntilAppointment =
      (appointmentStart.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Permitir cancelación si es más de 24 horas antes
    return hoursUntilAppointment >= 24;
  }

  // Para obtener citas activas (no canceladas)
  async getUserActiveAppointments(userId: string) {
    return this.appointmentsRepository.find({
      where: {
        user: { id: userId },
        status: Not(In(['cancelled', 'no-show'])),
      },
      order: { start: 'ASC' },
    });
  }

  // Para obtener historial incluyendo canceladas
  async getUserAppointmentHistory(userId: string) {
    return this.appointmentsRepository.find({
      where: { user: { id: userId } },
      order: { start: 'DESC' },
    });
  }
}
