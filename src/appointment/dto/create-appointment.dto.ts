import { IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';

export class CreateAppointmentDto {
  @IsNotEmpty()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: 'The date format must be YYYY-MM-DD.',
  })
  date: string;

  @IsNotEmpty()
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'The time format must be HH:mm.',
  })
  time: string;

  @IsNotEmpty()
  @IsString()
  timeZone: string;

  @IsString()
  comments: string;

  @IsUUID()
  serviceId: string;

  @IsUUID()
  staffId: string;
}
