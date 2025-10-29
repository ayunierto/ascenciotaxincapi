import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { AppPlatform } from '../entities/app-version.entity';

export class CreateAppVersionDto {
  @IsEnum(AppPlatform)
  platform: AppPlatform;

  @IsString()
  minSupportedVersion: string;

  @IsString()
  latestVersion: string;

  @IsBoolean()
  forceUpdate: boolean;

  @IsOptional()
  @IsString()
  releaseNotes?: string;
}
