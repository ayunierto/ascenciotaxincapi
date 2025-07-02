import { ExceptionResponse } from 'src/common/interfaces';
import { Appointment } from '../entities/appointment.entity';

export type GetCurrentUserAppointmentsResponse =
  | Appointment[]
  | ExceptionResponse;
