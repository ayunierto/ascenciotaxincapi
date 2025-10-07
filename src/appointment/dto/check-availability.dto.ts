import { IsString, IsUUID, Matches } from 'class-validator';

export class CheckAvailabilityDto {
  @IsUUID()
  staffId: string;

  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/, {
    message: 'date must be in the format YYYY-MM-DD',
  })
  date: string;
}
