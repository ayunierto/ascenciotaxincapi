import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  serviceId: string;

  @IsUUID()
  staffId: string;

  @IsISO8601()
  start!: string; // ISO local del usuario "YYYY-MM-DDTHH:mm"

  @IsString()
  timezone!: string; // IANA

  @IsOptional()
  @IsInt()
  @Min(1)
  durationMin?: number; // opcional si servicio tiene variable

  @IsString()
  @IsOptional()
  comments?: string;
}
