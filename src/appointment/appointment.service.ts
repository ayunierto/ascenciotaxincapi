import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/services/entities';
import { Between, In, Like, Repository } from 'typeorm';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from './entities/appointment.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { DateUtils } from './utils/date.utils';
import { CalendarService } from 'src/calendar/calendar.service';
import { ZoomService } from 'src/zoom/zoom.service';
import { MailService } from 'src/mail/mail.service';
import { DateTime } from 'luxon';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,

    private readonly zoomService: ZoomService,
    private readonly calendarService: CalendarService,
    private readonly mailService: MailService,

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
      // Rango cruza la medianoche
      return (
        timeInMinutes >= startTimeInMinutes || timeInMinutes <= endTimeInMinutes
      );
    }
    return (
      timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes
    );
  }

  async checkAvailability(
    staffId: string,
    startDateAndTime: Date,
    endDateAndTime: Date,
  ): Promise<boolean> {
    // Get the day of the selected date (1-7) 1: Monday, ..., 7: Sunday
    const startDateTime = startDateAndTime.toISOString();
    const weekday = DateTime.fromISO(startDateTime).weekday;

    // Check if the staff has a defined schedule for that day
    const staffSchedule = await this.scheduleRepository.findOne({
      where: { weekday: weekday, staff: { id: staffId } },
    });

    // Check if the staff member has a defined schedule for the indicated day
    if (!staffSchedule)
      throw new BadRequestException(
        'The staff member has no work schedule for the selected day',
      );

    const appointmentStartTimeToronto = this.dateUtils.converToIso8601ToToronto(
      new Date(startDateAndTime).toISOString(),
    );
    const appointmentEndTimeToronto = this.dateUtils.converToIso8601ToToronto(
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

    const overlappingAppointments = await this.appointmentRepository.find({
      where: {
        staff: { id: staffId },
        startDateAndTime: In([startDateAndTime, endDateAndTime]),
        endDateAndTime: In([startDateAndTime, endDateAndTime]),
      },
    });

    const conflictingAppointments = await this.appointmentRepository
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
      const {
        staff: staffId,
        service: serviceId,
        startDateAndTime,
        endDateAndTime,
        ...rest
      } = createAppointmentDto;

      // Check if the staff member exists
      const staff = await this.staffRepository.findOneBy({ id: staffId });
      if (!staff) throw new BadRequestException('Staff member not found');

      // Check if the service exists
      const service = await this.serviceRepository.findOneBy({ id: serviceId });
      if (!service) throw new BadRequestException('Service not found');

      // Check availability
      const isAvailable = await this.checkAvailability(
        staffId,
        new Date(startDateAndTime),
        new Date(endDateAndTime),
      );
      if (!isAvailable)
        throw new ConflictException('The selected time slot is not available');

      // Save appointment
      const appointment = this.appointmentRepository.create({
        user,
        staff,
        service,
        startDateAndTime: new Date(startDateAndTime),
        endDateAndTime: new Date(endDateAndTime),
        ...rest,
      });
      await this.appointmentRepository.save(appointment);

      // Crear una reunión de Zoom
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
      const event = await this.calendarService.createEvent({
        summary: `Appointment: ${service.name}`,
        description: `Zoom Meeting: ${meeting.join_url}`,
        startTime: startDateAndTime,
        endTime: endDateAndTime,
        timeZone: 'America/Toronto',
        location: `${service.address}`,
      });

      // Send email
      this.mailService.sendMail({
        to: user.email,
        serviceName: service.name,
        appointmentDate: DateTime.fromISO(startDateAndTime, {
          zone: 'utc',
        })
          .setZone('America/Toronto')
          .toFormat('yyyy-MM-dd'),
        appointmentTime: DateTime.fromISO(startDateAndTime, {
          zone: 'utc',
        })
          .setZone('America/Toronto')
          .toFormat('HH:mm:ss'),
        clientName: `${user.name} ${user.lastName}`,
        location: service.address,
        staffName: `${staff.name} ${staff.lastName}`,
        meetingLink: meeting.join_url,
      });

      return appointment;
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    return this.appointmentRepository.find();
  }

  async findOne(id: string) {
    return `This action returns a #${id} appointment`;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  async remove(id: string) {
    return `This action removes a #${id} appointment`;
  }

  async removeAll() {
    const query = this.appointmentRepository.createQueryBuilder('appointment');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Can not delete appointment',
          error: 'Can not delete appointment',
          cause: 'Unknown',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAppointmentsByStaffMember(staffMemberId: string, date: string) {
    const appointments = await this.appointmentRepository.find({
      where: {
        staff: { id: staffMemberId }, // ID del miembro del staff
        startDateAndTime: Between(
          new Date(`${date}T00:00:00.000Z`), // Inicio del día
          new Date(`${date}T23:59:59.999Z`), // Fin del día
        ),
      },
      relations: ['staff_member'], // Incluir la información del staff member en la respuesta
    });
  }
}
