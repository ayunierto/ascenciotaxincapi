import {
  BadRequestException,
  Injectable,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { Auth, calendar_v3, google } from 'googleapis';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';

// import * as fs from 'fs';
import { DateTime } from 'luxon';

@Injectable()
export class CalendarService implements OnModuleInit {
  private readonly logger = new Logger(CalendarService.name);
  private calendar: calendar_v3.Calendar;
  private calendarId: string;
  private auth: Auth.GoogleAuth | Auth.OAuth2Client; // Puede ser GoogleAuth para cuenta de servicio o OAuth2Client

  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!this.calendarId) {
      this.logger.error(
        'GOOGLE_CALENDAR_ID no está configurado en las variables de entorno.',
      );
      throw new Error('GOOGLE_CALENDAR_ID must be configured.');
    }
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!clientEmail || !privateKey) {
      this.logger.error(
        'GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY no están configurados en las variables de entorno.',
      );
      throw new Error(
        'Service account email and private key must be configured if GOOGLE_APPLICATION_CREDENTIALS is not set.',
      );
    }

    this.auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: [
        'https://www.googleapis.com/auth/calendar', // Acceso completo
        // 'https://www.googleapis.com/auth/calendar.events', // Acceso a eventos
      ],
    });

    // const credentialsBase64 = process.env.CREDENTIALS_BASE64;
    // const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString(
    //   'utf-8',
    // );

    // fs.writeFileSync('/tmp/credentials.json', credentialsJson); // Save the file temporarily

    // const auth = new google.auth.GoogleAuth({
    //     keyFile: '/tmp/credentials.json', // Use the temporal file
    //   scopes: ['https://www.googleapis.com/auth/calendar'],
    // });

    // ... After using the AUH, you can delete the file:
    // fs.unlinkSync('/tmp/credentials.json');

    this.calendar = google.calendar({ version: 'v3', auth: this.auth });
  }

  // Method to create an event on Google Calendar
  async createEvent(event: CreateCalendarEventDto) {
    if (!this.calendar) {
      this.logger.error('Calendar client not initialized.');
      throw new Error(
        'Calendar client not initialized. Check initialization logs.',
      );
    }

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

      this.logger.log(`Event created: ${response.data.htmlLink}`);
      return response.data.id;
    } catch (error) {
      console.error(error);
      return new BadRequestException('Error creating event');
    }
  }

  async onModuleInit() {
    try {
      await (this.auth as Auth.JWT).authorize(); // Autoriza el cliente JWT
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      this.logger.log('Google Calendar Service Initialized Successfully.');
    } catch (error) {
      this.logger.error(
        'Error initializing Google Calendar client:',
        error.stack || error.message,
      );
      throw new Error(
        `Failed to initialize Google Calendar client: ${error.message}`,
      );
    }
  }

  /**
   * Lists upcoming events from the configured calendar.
   * @param maxResults Maximum number of events to return.
   * @returns A list of events.
   */
  async listUpcomingEvents(
    maxResults: number = 10,
  ): Promise<calendar_v3.Schema$Event[]> {
    if (!this.calendar) {
      this.logger.error('Calendar client not initialized.');
      throw new Error(
        'Calendar client not initialized. Check initialization logs.',
      );
    }
    try {
      const now = new Date().toISOString();
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: now,
        maxResults: maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.data.items || [];
    } catch (error) {
      this.logger.error(
        `Error fetching upcoming events: ${error.message}`,
        error.stack,
      );
      // Puedes relanzar el error o manejarlo de forma más específica
      throw new Error(`Failed to list upcoming events: ${error.message}`);
    }
  }

  /**
   * Creates a new event in the configured calendar.
   * @param eventDetails Details of the event to create.
   * @returns The created event.
   */
  async createEvent2(
    eventDetails: calendar_v3.Schema$Event,
  ): Promise<calendar_v3.Schema$Event> {
    if (!this.calendar) {
      this.logger.error('Calendar client not initialized.');
      throw new Error(
        'Calendar client not initialized. Check initialization logs.',
      );
    }
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: eventDetails,
      });
      this.logger.log(`Event created: ${response.data.htmlLink}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Error creating event: ${error.message}`, error.stack);
      // Considerar si el error es por `error.response.data.error` para mensajes más específicos de la API de Google
      const googleApiError = error.response?.data?.error;
      if (googleApiError) {
        this.logger.error(
          `Google API Error: ${googleApiError.message} (Code: ${googleApiError.code})`,
        );
        throw new Error(
          `Failed to create event (Google API: ${googleApiError.message})`,
        );
      }
      throw new Error(`Failed to create event: ${error.message}`);
    }
  }

  /**
   * Gets details for a specific event.
   * @param eventId The ID of the event to retrieve.
   * @returns The event details.
   */
  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    if (!this.calendar) {
      this.logger.error('Calendar client not initialized.');
      throw new Error(
        'Calendar client not initialized. Check initialization logs.',
      );
    }
    try {
      const response = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId: eventId,
      });
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error fetching event ${eventId}: ${error.message}`,
        error.stack,
      );
      const googleApiError = error.response?.data?.error;
      if (googleApiError && googleApiError.code === 404) {
        throw new Error(`Event with ID ${eventId} not found.`);
      }
      if (googleApiError) {
        this.logger.error(
          `Google API Error: ${googleApiError.message} (Code: ${googleApiError.code})`,
        );
        throw new Error(
          `Failed to get event (Google API: ${googleApiError.message})`,
        );
      }
      throw new Error(`Failed to get event ${eventId}: ${error.message}`);
    }
  }

  /**
   * Updates an existing event.
   * @param eventId The ID of the event to update.
   * @param eventDetails The new details for the event.
   * @returns The updated event.
   */
  async updateEvent(
    eventId: string,
    eventDetails: calendar_v3.Schema$Event,
  ): Promise<calendar_v3.Schema$Event> {
    if (!this.calendar) {
      this.logger.error('Calendar client not initialized.');
      throw new Error(
        'Calendar client not initialized. Check initialization logs.',
      );
    }
    try {
      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId: eventId,
        requestBody: eventDetails,
      });
      this.logger.log(`Event updated: ${response.data.htmlLink}`);
      return response.data;
    } catch (error) {
      this.logger.error(
        `Error updating event ${eventId}: ${error.message}`,
        error.stack,
      );
      const googleApiError = error.response?.data?.error;
      if (googleApiError) {
        this.logger.error(
          `Google API Error: ${googleApiError.message} (Code: ${googleApiError.code})`,
        );
        throw new Error(
          `Failed to update event (Google API: ${googleApiError.message})`,
        );
      }
      throw new Error(`Failed to update event ${eventId}: ${error.message}`);
    }
  }

  /**
   * Deletes an event.
   * @param eventId The ID of the event to delete.
   */
  async deleteEvent(eventId: string): Promise<void> {
    if (!this.calendar) {
      this.logger.error('Calendar client not initialized.');
      throw new Error(
        'Calendar client not initialized. Check initialization logs.',
      );
    }
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId: eventId,
      });
      this.logger.log(`Event ${eventId} deleted successfully.`);
    } catch (error) {
      this.logger.error(
        `Error deleting event ${eventId}: ${error.message}`,
        error.stack,
      );
      const googleApiError = error.response?.data?.error;
      if (googleApiError) {
        this.logger.error(
          `Google API Error: ${googleApiError.message} (Code: ${googleApiError.code})`,
        );
        throw new Error(
          `Failed to delete event (Google API: ${googleApiError.message})`,
        );
      }
      throw new Error(`Failed to delete event ${eventId}: ${error.message}`);
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
