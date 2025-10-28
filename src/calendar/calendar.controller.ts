import { Controller, Post, Body, Get, Query, Param } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { calendar_v3 } from 'googleapis';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly googleCalendarService: CalendarService) {}

  @Post('events')
  async createEvent(@Body() createCalendarEventDto: calendar_v3.Schema$Event) {
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
