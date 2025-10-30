import { IsBoolean, IsLocale, IsTimeZone } from 'class-validator';

export class CreateSettingDto {
  @IsTimeZone()
  timeZone: string;

  @IsLocale()
  locale: string;

  @IsBoolean()
  executedSeed: boolean;
}
