import { IsString, Matches } from 'class-validator';

export class CreateCalendarEventDto {
  @IsString()
  summary: string;

  @IsString()
  location: string;

  @IsString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/, {
    message: 'Start Time: The format is incorrect',
  })
  startTime: string;
  @IsString()
  @Matches(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})\.(\d{3})$/, {
    message: 'End Time: The format is incorrect',
  })
  endTime: string;
  @IsString()
  timeZone: string;
  @IsString()
  description: string;
}
