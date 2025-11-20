import { StaffMember } from 'src/bookings/staff-members/entities/staff-member.entity';

export interface AvailableSlot {
  /** Tiempo de inicio del slot en formato ISO 8601 (UTC). Ejemplo: '2025-10-20T14:30:00.000Z' */
  startTimeUTC: string;
  /** Tiempo de fin del slot en formato ISO 8601 (UTC). Ejemplo: '2025-10-20T15:00:00.000Z' */
  endTimeUTC: string;
  /** Lista de miembros del Staff disponibles para este slot. */
  availableStaff: StaffMember[];
}
