import { IsString, Matches } from 'class-validator';

export class SendMailDto {
  @IsString()
  clientName: string;

  @IsString()
  staffName: string;

  @IsString()
  serviceName: string;

  @IsString()
  appointmentDate: string;

  @IsString()
  appointmentTime: string;

  @IsString()
  location: string;
}
