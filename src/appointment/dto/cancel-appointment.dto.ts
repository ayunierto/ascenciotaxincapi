import { IsUUID, IsOptional, IsString } from 'class-validator';

export class CancelAppointmentDto {
  @IsUUID()
  appointmentId!: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
