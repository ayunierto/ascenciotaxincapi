import { IsString } from 'class-validator';

export class CreateReportDto {
  @IsString()
  startDate: string;

  @IsString()
  endDate: string;
}
