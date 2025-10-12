import { IsTimeZone } from 'class-validator';

export class CreateSettingDto {
  @IsTimeZone()
  timeZone: string;
}
