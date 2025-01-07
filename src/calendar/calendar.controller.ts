import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly googleCalendarService: CalendarService) {}

  @Post('events')
  async createEvent(@Body() createCalendarEventDto: CreateCalendarEventDto) {
    const createdEvent = await this.googleCalendarService.createEvent(
      createCalendarEventDto,
    );
    return createdEvent;
  }

  @Get('events')
  async listEvents() {
    const listEvents = await this.googleCalendarService.listEvents();
    return listEvents;
  }

  @Get('has-events/:timeMin/:timeMax')
  async hasEvents(
    @Query('timeMin') timeMin: string,
    @Query('timeMax') timeMax: string,
  ) {
    const events = await this.googleCalendarService.checkEventsInRange(
      timeMin,
      timeMax,
    );
    return events;
    // return { hasEvents: events.length > 0 };
  }
}
