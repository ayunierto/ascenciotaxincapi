import { BadRequestException, Injectable } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';

import * as fs from 'fs';
import { DateTime } from 'luxon';

@Injectable()
export class CalendarService {
  // Google
  private calendar: calendar_v3.Calendar;
  private calendarId = process.env.GOOGLE_CALENDAR_ACCOUNT;
  private alternativeCalendarId =
    process.env.GOOGLE_CALENDAR_ACCOUNT_ALTERNATIVE;

  constructor() {
    const credentialsBase64 = process.env.CREDENTIALS_BASE64;
    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString(
      'utf-8',
    );

    fs.writeFileSync('/tmp/credentials.json', credentialsJson); // Save the file temporarily

    const auth = new google.auth.GoogleAuth({
      keyFile: '/tmp/credentials.json', // Use the temporal file
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    // ... After using the AUH, you can delete the file:
    // fs.unlinkSync('/tmp/credentials.json');

    this.calendar = google.calendar({ version: 'v3', auth });
  }

  // Method to create an event on Google Calendar
  async createEvent(event: CreateCalendarEventDto) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: {
          summary: event.summary,
          location: event.location,
          start: {
            dateTime: event.startTime,
            timeZone: event.timeZone,
          },
          end: {
            dateTime: event.endTime,
            timeZone: event.timeZone,
          },
          description: `${event.description}`,
        },
      });

      // Create an alternative calendar event
      const alternativeCalendarResponse = await this.calendar.events.insert({
        calendarId: this.alternativeCalendarId,
        requestBody: {
          summary: event.summary,
          location: event.location,
          start: {
            dateTime: event.startTime,
            timeZone: event.timeZone,
          },
          end: {
            dateTime: event.endTime,
            timeZone: event.timeZone,
          },
          description: `${event.description}`,
        },
      });

      console.log('Event created.');
      return response.data.id;
    } catch (error) {
      console.error(error);
      return new BadRequestException('Error creating event');
    }
  }

  /**
   *
   * @param startDateTime 2025-01-06T00:00:00.000Z
   * @param endDateTime 2025-01-06T14:00:00.000Z
   * @returns
   */
  async checkEventsInRange(startDateTime: string, endDateTime: string) {
    try {
      const timeMin = new Date(startDateTime).toISOString();
      const timeMax = new Date(endDateTime).toISOString();

      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items.map((item) => {
        return {
          summary: item.summary,
          start: DateTime.fromISO(item.start.dateTime).toUTC(),
          end: DateTime.fromISO(item.end.dateTime).toUTC(),
        };
      });
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  // Method for listing events

  async listEvents() {
    const response = await this.calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ACCOUNT,
      timeMin: new Date().toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: 'startTime',
    });
    return response.data.items;
  }

  async remove(id: string) {
    const response = await this.calendar.events.delete({
      calendarId: this.calendarId,
      eventId: id,
    });
    return response;
  }
}
