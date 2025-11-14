import { IsNotEmpty, IsNumber, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  @IsNotEmpty()
  dayOfWeek: number; // 0=Sunday, 1=Monday, ..., 6=Saturday

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid Time Format. It must be HH:mm',
  })
  startTime: string;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid Time Format. It must be HH:mm',
  })
  endTime: string;
}
