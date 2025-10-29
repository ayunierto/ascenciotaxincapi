import { PartialType } from '@nestjs/mapped-types';
import { CreateAppVersionDto } from './create-app-version.dto';

export class UpdateAppVersionDto extends PartialType(CreateAppVersionDto) {}
