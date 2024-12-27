import { BadRequestException, Injectable } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';

@Injectable()
export class CalendarService {
  // Google
  private calendar: calendar_v3.Calendar;
  private SCOPE = ['https://www.googleapis.com/auth/calendar'];
  private calendarId = process.env.GOOGLE_CALENDAR_ACCOUNT;
  private client_email = process.env.GOOGLE_CALENDAR_CLIENT_EMAIL;
  private private_key = process.env.GOOGLE_CALENDAR_PRIVATE_KEY;

  constructor() {
    // Configurar el cliente JWT
    const authClient = new google.auth.JWT({
      email: this.client_email,
      key: this.private_key,
      // keyFile: this.CREDENTIALS_PATH,
      scopes: this.SCOPE,
    });

    this.calendar = google.calendar({ version: 'v3', auth: authClient });
  }

  // Método para crear un evento en Google Calendar
  async createEvent(event: CreateCalendarEventDto) {
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId, // Cambia esto al ID del calendario compartido si no es el calendario principal
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

      return response.data;
    } catch (error) {
      console.log(error);
      return new BadRequestException('Error when creating event');
    }
  }

  //
  async checkEventsInRange(timeMin: string, timeMax: string) {
    try {
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin,
        timeMax,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items;
    } catch (error) {
      console.log(error);
      return [];
    }
  }

  // Método para listar eventos (si también deseas implementarlo)
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
}
