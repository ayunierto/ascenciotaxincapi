import { IsString } from 'class-validator';

export class CreateCalendarEventDto {
  @IsString()
  summary: string;

  @IsString()
  location: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  timeZone: string;

  @IsString()
  description: string;
}
