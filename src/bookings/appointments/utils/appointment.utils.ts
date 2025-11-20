import { DateTime } from 'luxon';
import { BadRequestException, ConflictException } from '@nestjs/common';
import { Schedule } from 'src/bookings/schedules/entities/schedule.entity';

export interface TimeValidationConfig {
  startTime: string;
  endTime: string;
  timeZone: string;
  start: DateTime;
  end: DateTime;
}

export const validateWorkingHours = (
  schedule: Schedule,
  startDateAndTime: DateTime,
  endDateAndTime: DateTime,
  timeZone: string,
): void => {
  if (!schedule || !startDateAndTime || !endDateAndTime || !timeZone) {
    throw new BadRequestException(
      'Missing required parameters for schedule validation',
    );
  }

  // Convertir la hora del horario a DateTime
  const [startHour, startMinute] = schedule.startTime.split(':').map(Number);
  const [endHour, endMinute] = schedule.endTime.split(':').map(Number);

  const startOfSchedule = startDateAndTime
    .set({
      hour: startHour,
      minute: startMinute,
      second: 0,
      millisecond: 0,
    })
    .setZone(timeZone, { keepLocalTime: true });

  const endOfSchedule = startDateAndTime
    .set({
      hour: endHour,
      minute: endMinute,
      second: 0,
      millisecond: 0,
    })
    .setZone(timeZone, { keepLocalTime: true });

  // Normalizar las fechas de la cita a la zona horaria correcta
  const normalizedStartTime = startDateAndTime.setZone(timeZone);
  const normalizedEndTime = endDateAndTime.setZone(timeZone);

  if (normalizedStartTime < startOfSchedule) {
    throw new ConflictException(
      `Appointment starts before working hours (${schedule.startTime})`,
    );
  }

  if (normalizedEndTime > endOfSchedule) {
    throw new ConflictException(
      `Appointment ends after working hours (${schedule.endTime})`,
    );
  }
};

export const formatAppointmentDescription = (
  zoomMeetingLink: string,
  staffFirstName: string,
  staffLastName: string,
  userFirstName: string,
  userLastName: string,
  userEmail: string,
  userPhoneNumber: string,
) => `
Zoom Meeting: ${zoomMeetingLink} 

Staff: ${staffFirstName} ${staffLastName}
Client: ${userFirstName} ${userLastName}
Email: ${userEmail}
Phone Number: ${userPhoneNumber}
`;

export const getZoomMeetingConfig = (
  serviceName: string,
  startTime: string,
  timeZone: string,
) => {
  // Convertir ISO string a formato requerido por Zoom (yyyy-MM-ddTHH:mm:ss)
  const zoomStartTime = DateTime.fromISO(startTime)
    .setZone(timeZone)
    .toFormat("yyyy-MM-dd'T'HH:mm:ss");

  return {
    agenda: 'Appointments',
    default_password: false,
    duration: 60,
    password: '123456',
    settings: {
      host_video: true,
      join_before_host: true,
      participant_video: true,
    },
    start_time: zoomStartTime,
    timezone: timeZone,
    topic: `Appointment: ${serviceName}`,
    type: 2,
  };
};

export const validateTimeZone = (timeZone: string | undefined): string => {
  if (!timeZone) {
    return 'America/Toronto'; // Zona horaria por defecto
  }

  try {
    // Intentar crear una fecha con la zona horaria proporcionada
    const testDate = DateTime.now().setZone(timeZone);

    // Verificar si la zona horaria es válida
    if (!testDate.isValid || testDate.invalidReason === 'unsupported zone') {
      throw new BadRequestException(`Invalid time zone: ${timeZone}`);
    }

    return timeZone;
  } catch (error) {
    throw new BadRequestException(
      `Error validating time zone: ${error.message}`,
    );
  }
};

export const validateDatesForUpdate = (
  startDate: DateTime | null,
  endDate: DateTime | null,
  existingStartDate: DateTime | null,
  existingEndDate: DateTime | null,
): { startDateAndTime: DateTime; endDateAndTime: DateTime } => {
  // Determinar las fechas a usar
  const startDateAndTime = startDate || existingStartDate;
  const endDateAndTime = endDate || existingEndDate;

  // Validar que tengamos fechas para trabajar
  if (!startDateAndTime || !endDateAndTime) {
    throw new BadRequestException('Both start and end dates must be provided');
  }

  // Asegurarse de que las fechas sean instancias válidas de DateTime
  if (!startDateAndTime.isValid || !endDateAndTime.isValid) {
    throw new BadRequestException('Invalid provided dates');
  }

  // Validar que la fecha de inicio sea anterior a la fecha de fin
  if (startDateAndTime >= endDateAndTime) {
    throw new BadRequestException('Start date must be earlier than end date');
  }

  // Validar que la fecha de inicio no sea en el pasado
  const now = DateTime.now().minus({ minutes: 5 }); // 5 minutos de gracia
  if (startDateAndTime < now) {
    throw new BadRequestException('Start date cannot be in the past');
  }

  // Validar duración mínima y máxima de la cita
  const duration = endDateAndTime.diff(startDateAndTime, 'minutes').minutes;
  if (duration < 15) {
    throw new BadRequestException('Appointment must last at least 15 minutes');
  }
  if (duration > 480) {
    // 8 horas
    throw new BadRequestException('Appointment cannot last more than 8 hours');
  }

  return { startDateAndTime, endDateAndTime };
};
