import { IsNumber, IsString } from 'class-validator';

export class CreateSubscriptionDto {
  // @IsString()
  // userId: string;

  @IsString()
  planId: string;

  @IsNumber()
  durationInMonths: number;

  // @IsDateString()
  // startDate: Date;

  // @IsDateString()
  // endDate: Date;

  // @IsString()
  // status: string;
}
