import { IsUUID, IsString, IsISO8601 } from 'class-validator';

export class SearchAvailabilityDto {
  @IsUUID()
  staffId!: string;

  @IsUUID()
  serviceId!: string;

  @IsISO8601()
  from!: string; // ISO en UTC o local, se interpretará con timezone

  @IsISO8601()
  to!: string;

  @IsString()
  timezone!: string; // IANA, ej. "America/Lima"
}
