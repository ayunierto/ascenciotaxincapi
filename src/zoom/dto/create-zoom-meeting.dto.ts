import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ZoomMeetingSettingsDto {
  @IsBoolean()
  @IsOptional()
  host_video?: boolean;

  @IsBoolean()
  @IsOptional()
  participant_video?: boolean;

  @IsBoolean()
  @IsOptional()
  join_before_host?: boolean;

  @IsBoolean()
  @IsOptional()
  mute_upon_entry?: boolean;

  @IsBoolean()
  @IsOptional()
  watermark?: boolean;

  @IsString()
  @IsOptional()
  audio?: string;

  @IsString()
  @IsOptional()
  auto_recording?: string;
}

export class CreateZoomMeetingDto {
  @IsString()
  @IsOptional()
  agenda?: string;

  @IsString()
  topic: string;

  @IsInt()
  @IsOptional()
  type?: number = 2; // 1: instant, 2: scheduled, 3: recurring with no fixed time, 8: recurring with fixed time

  @IsString()
  @IsOptional()
  start_time?: string;

  @IsInt()
  @IsOptional()
  duration?: number;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsString()
  @IsOptional()
  password?: string;

  @IsBoolean()
  @IsOptional()
  default_password?: boolean;

  @ValidateNested()
  @Type(() => ZoomMeetingSettingsDto)
  @IsOptional()
  settings?: ZoomMeetingSettingsDto;
}
