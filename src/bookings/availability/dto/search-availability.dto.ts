import { IsISO8601, IsOptional, IsTimeZone, IsUUID } from 'class-validator';

export class SearchAvailabilityDto {
  @IsUUID()
  serviceId: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsISO8601()
  date: string;

  @IsTimeZone()
  timeZone: string; // IANA, ej. "America/Lima", "America/Toronto", etc.
}
