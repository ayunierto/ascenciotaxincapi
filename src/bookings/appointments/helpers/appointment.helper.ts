import { BadRequestException, Logger } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Repository } from 'typeorm';
import { formatAppointmentDescription } from '../utils/appointment.utils';
import { Schedule } from 'src/bookings/schedules/entities/schedule.entity';
import { StaffMembersService } from 'src/bookings/staff-members/staff-members.service';
import { ServicesService } from 'src/bookings/services/services.service';
import { Service } from 'src/bookings/services/entities/service.entity';
import { StaffMember } from 'src/bookings/staff-members/entities/staff-member.entity';

export class AppointmentHelper {
  private readonly logger = new Logger(AppointmentHelper.name);

  constructor(
    private readonly scheduleRepository: Repository<Schedule>,
    private readonly staffMembersService: StaffMembersService,
    private readonly servicesService: ServicesService,
  ) {}

  async validateAndGetSchedule(staffId: string, startDate: DateTime) {
    const dayOfWeek = startDate.weekday % 7;
    const schedule = await this.scheduleRepository.findOne({
      where: {
        staffMembers: { id: staffId },
        dayOfWeek,
      },
    });

    if (!schedule) {
      throw new BadRequestException(
        'The staff has no schedule for the selected day. Please verify information.',
      );
    }

    return schedule;
  }

  async getServiceAndStaff(
    serviceId?: string,
    staffId?: string,
    existingService?: Service,
    existingStaff?: StaffMember,
  ) {
    const service = serviceId
      ? await this.servicesService.findOne(serviceId)
      : existingService;

    const staff = staffId
      ? await this.staffMembersService.findOne(staffId)
      : existingStaff;

    return { service, staff };
  }

  async updateExternalServices(
    zoomService: any,
    calendarService: any,
    appointment: any,
    updateData: {
      startDateAndTime: DateTime;
      endDateAndTime: DateTime;
      timeZone: string;
      serviceName: string;
      serviceAddress: string;
      staffName: { firstName: string; lastName: string };
      userName: { firstName: string; lastName: string };
      userEmail: string;
      userPhoneNumber: string;
    },
  ) {
    const {
      startDateAndTime,
      endDateAndTime,
      timeZone,
      serviceName,
      serviceAddress,
      staffName,
      userName,
      userEmail,
      userPhoneNumber,
    } = updateData;

    try {
      // Actualizar reunión de Zoom
      if (appointment.zoomMeetingId && appointment.zoomMeetingId !== 'N/A') {
        try {
          // Zoom requiere formato yyyy-MM-ddTHH:mm:ss (sin Z al final)
          const zoomStartTime = startDateAndTime
            .setZone(timeZone)
            .toFormat("yyyy-MM-dd'T'HH:mm:ss");
          this.logger.log(
            `Updating Zoom meeting ${appointment.zoomMeetingId} with start_time: ${zoomStartTime}, timezone: ${timeZone}`,
          );

          await zoomService.updateMeeting(appointment.zoomMeetingId, {
            start_time: zoomStartTime,
            timezone: timeZone,
            topic: `Appointment: ${serviceName}`,
          });
          this.logger.log(
            `Zoom meeting ${appointment.zoomMeetingId} updated successfully`,
          );
        } catch (zoomError) {
          this.logger.error('Error updating Zoom meeting:', zoomError.message);
          // Continuar con la actualización del calendario aunque Zoom falle
        }
      }

      // Actualizar evento del calendario
      if (
        appointment.calendarEventId &&
        appointment.calendarEventId !== 'N/A'
      ) {
        try {
          const calendarStartTime = startDateAndTime.setZone(timeZone).toISO();
          const calendarEndTime = endDateAndTime.setZone(timeZone).toISO();

          this.logger.log(
            `Updating Calendar event ${appointment.calendarEventId}`,
          );
          this.logger.log(
            `Original start (UTC): ${startDateAndTime.toUTC().toISO()}`,
          );
          this.logger.log(
            `Original end (UTC): ${endDateAndTime.toUTC().toISO()}`,
          );
          this.logger.log(`Calendar start (${timeZone}): ${calendarStartTime}`);
          this.logger.log(`Calendar end (${timeZone}): ${calendarEndTime}`);

          const updatePayload = {
            summary: `Appointment: ${serviceName}`,
            location: serviceAddress,
            description: formatAppointmentDescription(
              appointment.zoomMeetingLink,
              staffName.firstName,
              staffName.lastName,
              userName.firstName,
              userName.lastName,
              userEmail,
              userPhoneNumber,
            ),
            start: {
              dateTime: calendarStartTime,
              timeZone: timeZone,
            },
            end: {
              dateTime: calendarEndTime,
              timeZone: timeZone,
            },
          };

          await calendarService.updateEvent(
            appointment.calendarEventId,
            updatePayload,
          );
          this.logger.log(
            `Calendar event ${appointment.calendarEventId} updated successfully`,
          );
        } catch (calendarError) {
          this.logger.error(
            'Error updating Calendar event:',
            calendarError.message,
          );
        }
      }
    } catch (error) {
      this.logger.error('Error updating external services:', error);
      // No lanzamos el error para permitir que la actualización de la cita continúe
    }
  }
}
