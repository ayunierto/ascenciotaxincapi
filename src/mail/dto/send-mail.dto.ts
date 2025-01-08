import { IsString, Matches } from 'class-validator';

export class SendMailDto {
  @IsString()
  to: string;

  @IsString()
  clientName: string;

  @IsString()
  clientEmail?: string;

  @IsString()
  clientPhoneNumber?: string;

  @IsString()
  staffName: string;

  @IsString()
  serviceName: string;

  @IsString()
  appointmentDate: string;

  @IsString()
  appointmentTime: string;

  @IsString()
  meetingLink: string;

  @IsString()
  location: string;
}
