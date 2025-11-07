import { PartialType } from '@nestjs/mapped-types';
import { CreateZoomMeetingDto } from './create-zoom-meeting.dto';

export class UpdateZoomMeetingDto extends PartialType(CreateZoomMeetingDto) {}