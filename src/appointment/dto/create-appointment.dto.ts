import {
  IsISO8601,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsUUID()
  serviceId: string;

  @IsUUID()
  staffId: string;

  @IsISO8601()
  start: string; // ISO local of user "YYYY-MM-DDTHH:mm"

  @IsISO8601()
  end: string; // ISO local of user "YYYY-MM-DDTHH:mm"

  @IsTimeZone()
  timeZone: string; // IANA

  @IsString()
  @IsOptional()
  comments?: string;

  @IsString()
  @IsOptional()
  source?: 'app' | 'admin' | 'imported' | 'api';
}
