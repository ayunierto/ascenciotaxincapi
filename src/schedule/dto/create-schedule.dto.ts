import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateScheduleDto {
  @IsNumber()
  weekday: number;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  @IsOptional()
  staff?: string;
}
