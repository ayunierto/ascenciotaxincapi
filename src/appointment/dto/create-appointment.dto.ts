import {
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  serviceId: string;

  @IsUUID()
  staffId: string;

  @IsISO8601()
  start: string; // ISO local del usuario "YYYY-MM-DDTHH:mm"

  @IsISO8601()
  end: string; // ISO local del usuario "YYYY-MM-DDTHH:mm"

  @IsTimeZone()
  timeZone: string; // IANA

  @IsString()
  @IsOptional()
  comments?: string;
}
