import { BadRequestException, Injectable } from '@nestjs/common';
import { calendar_v3, google } from 'googleapis';
import { join } from 'path';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import axios from 'axios';

@Injectable()
export class CalendarService {
  private calendar: calendar_v3.Calendar;
  private SCOPE = ['https://www.googleapis.com/auth/calendar'];
  private CREDENTIALS_PATH = join(process.cwd(), 'credentials.json');
  private calendarId = process.env.GOOGLE_CALENDAR_ACCOUNT;
  private ZOOM_OAUTH_ENDPOINT = 'https://zoom.us/oauth/token';
  private ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

  constructor() {
    // Configurar el cliente JWT
    const authClient = new google.auth.JWT({
      // email: credentials.email,
      // key: credentials.private_key,
      keyFile: this.CREDENTIALS_PATH,
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
          description: `${event.description} `,
        },
      });

      // TODO: crear reunion
      console.log(
        await this.createZoomMeeting({
          agenda: 'Appointments',
          default_password: false,
          duration: 60,
          password: '123456',
          settings: {
            host_video: true,
            join_before_host: true,
            participant_video: true,
          },
          start_time: event.startTime,
          timezone: event.timeZone,
          topic: 'My Meeting',
          type: 2,
        }),
      );
      return response.data;
    } catch (error) {
      console.log(error);
      return new BadRequestException('Error when creating event');
    }
  }

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

  async createZoomMeeting(body) {
    try {
      const token = (await this.getZoomToken()).access_token;

      const request = await axios.post(
        `${this.ZOOM_API_BASE_URL}/users/me/meetings`,
        body,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return request.data;
    } catch (error) {
      return error;
    }
  }

  /**
   * Retrieve token from Zoom API
   *
   * @returns {Object} { access_token, expires_in, error }
   */
  async getZoomToken() {
    try {
      const { ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, ZOOM_CLIENT_SECRET } =
        process.env;

      const request = await axios.post(
        this.ZOOM_OAUTH_ENDPOINT,
        `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${ZOOM_CLIENT_ID}:${ZOOM_CLIENT_SECRET}`).toString('base64')}`,
          },
        },
      );

      const { access_token, expires_in } = await request.data;

      return { access_token, expires_in, error: null };
    } catch (error) {
      return { access_token: null, expires_in: null, error };
    }
  }
}
