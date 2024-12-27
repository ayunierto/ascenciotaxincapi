import { PartialType } from '@nestjs/mapped-types';
import { CreateCalendarEventDto } from './create-calendar-event.dto';

export class UpdateCalendarDto extends PartialType(CreateCalendarEventDto) {}
