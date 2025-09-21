import { IsNotEmpty, IsNumber, Matches } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  @IsNotEmpty()
  weekday: number;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid Time Format. It must be HH:MI',
  })
  startTime: string;

  @IsNotEmpty()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Invalid Time Format. It must be HH:MI',
  })
  endTime: string;
}
