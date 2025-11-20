import {
  Injectable,
  Logger,
  OnModuleInit,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Auth, calendar_v3, google } from 'googleapis';

import { DateTime, Interval } from 'luxon';

@Injectable()
export class CalendarService implements OnModuleInit {
  private readonly logger = new Logger(CalendarService.name);
  private calendar: calendar_v3.Calendar;
  private calendarId: string;
  private auth: Auth.GoogleAuth | Auth.OAuth2Client;

  constructor() {
    this.calendarId = process.env.GOOGLE_CALENDAR_ID;
    if (!this.calendarId) {
      this.logger.error(
        'GOOGLE_CALENDAR_ID no está configurado en las variables de entorno.',
      );
      throw new BadRequestException('GOOGLE_CALENDAR_ID must be configured.');
    }
    // La inicialización real se hace en onModuleInit
  }

  // Method to create an event on Google Calendar
  /**
   * Crea un evento en Google Calendar.
   * @param body Detalles del evento.
   * @returns El ID del evento creado.
   */
  async createEvent(body: calendar_v3.Schema$Event): Promise<string> {
    this.ensureInitialized();
    if (!body || !body.start || !body.end) {
      throw new BadRequestException('Event body, start and end are required');
    }
    try {
      const response = await this.calendar.events.insert({
        calendarId: this.calendarId,
        requestBody: body,
      });
      this.logger.log(`Event created: ${response.data.htmlLink}`, {
        eventId: response.data.id,
      });
      return response.data.id;
    } catch (error) {
      this.handleGoogleApiError(error, 'Error creating event');
    }
  }

  async onModuleInit() {
    const clientEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (!clientEmail || !privateKey) {
      this.logger.error(
        'GOOGLE_SERVICE_ACCOUNT_EMAIL o GOOGLE_PRIVATE_KEY no están configurados en las variables de entorno.',
      );
      throw new BadRequestException(
        'Service account email and private key must be configured.',
      );
    }
    try {
      this.auth = new google.auth.JWT({
        email: clientEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });
      await (this.auth as Auth.JWT).authorize();
      this.calendar = google.calendar({ version: 'v3', auth: this.auth });
      this.logger.log('Google Calendar Service Initialized Successfully.');
    } catch (error) {
      this.logger.error(
        'Error initializing Google Calendar client:',
        error.stack || error.message,
      );
      throw new InternalServerErrorException(
        `Failed to initialize Google Calendar client: ${error.message}`,
      );
    }
  }

  /**
   * Lists upcoming events from the configured calendar.
   * @param maxResults Maximum number of events to return.
   * @returns A list of events.
   */
  /**
   * Lista los próximos eventos del calendario.
   * @param maxResults Máximo de eventos a retornar.
   */
  async listUpcomingEvents(
    maxResults: number = 10,
  ): Promise<calendar_v3.Schema$Event[]> {
    this.ensureInitialized();
    try {
      const now = new Date().toISOString();
      const response = await this.calendar.events.list({
        calendarId: this.calendarId,
        timeMin: now,
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });
      return response.data.items || [];
    } catch (error) {
      this.handleGoogleApiError(error, 'Failed to list upcoming events');
    }
  }

  /**
   * Gets details for a specific event.
   * @param eventId The ID of the event to retrieve.
   * @returns The event details.
   */
  /**
   * Obtiene los detalles de un evento específico.
   * @param eventId ID del evento.
   */
  async getEvent(eventId: string): Promise<calendar_v3.Schema$Event> {
    this.ensureInitialized();
    if (!eventId) throw new BadRequestException('eventId is required');
    try {
      const response = await this.calendar.events.get({
        calendarId: this.calendarId,
        eventId,
      });
      return response.data;
    } catch (error) {
      const googleApiError = error.response?.data?.error;
      if (googleApiError && googleApiError.code === 404) {
        throw new NotFoundException(`Event with ID ${eventId} not found.`);
      }
      this.handleGoogleApiError(error, `Failed to get event ${eventId}`);
    }
  }

  /**
   * Updates an existing event.
   * @param eventId The ID of the event to update.
   * @param eventDetails The new details for the event.
   * @returns The updated event.
   */
  /**
   * Actualiza un evento existente.
   * @param eventId ID del evento.
   * @param eventDetails Nuevos detalles.
   */
  async updateEvent(
    eventId: string,
    eventDetails: calendar_v3.Schema$Event,
  ): Promise<calendar_v3.Schema$Event> {
    this.ensureInitialized();
    if (!eventId || !eventDetails)
      throw new BadRequestException('eventId and eventDetails are required');
    try {
      this.logger.log(`Updating Calendar event ${eventId}`, {
        summary: eventDetails.summary,
        start: eventDetails.start,
        end: eventDetails.end,
        location: eventDetails.location,
      });
      const response = await this.calendar.events.update({
        calendarId: this.calendarId,
        eventId,
        requestBody: eventDetails,
      });
      this.logger.log(`Event updated successfully: ${response.data.htmlLink}`);
      return response.data;
    } catch (error) {
      this.handleGoogleApiError(error, `Failed to update event ${eventId}`);
    }
  }

  /**
   * Deletes an event.
   * @param eventId The ID of the event to delete.
   */
  /**
   * Elimina un evento por ID.
   * @param eventId ID del evento.
   */
  async deleteEvent(eventId: string): Promise<void> {
    this.ensureInitialized();
    if (!eventId) throw new BadRequestException('eventId is required');
    try {
      await this.calendar.events.delete({
        calendarId: this.calendarId,
        eventId,
      });
      this.logger.log(`Event ${eventId} deleted successfully.`);
    } catch (error) {
      this.handleGoogleApiError(error, `Failed to delete event ${eventId}`);
    }
  }

  /**
   * Verifica si hay eventos en un rango de fechas dado.
   *
   * @param startDateTime 2025-01-06T00:00:00.000Z
   * @param endDateTime 2025-01-06T14:00:00.000Z
   * @param targetTimeZone Zona horaria para convertir los tiempos (por defecto 'America/Toronto')
   * @returns Una lista de intervalos ocupados en la zona horaria objetivo.
   */
  /**
   * Verifica si hay eventos en un rango de fechas dado.
   * @param startDateTime Fecha/hora inicio (ISO).
   * @param endDateTime Fecha/hora fin (ISO).
   * @param targetTimeZone Zona horaria objetivo.
   */
  async checkEventsInRange(
    startDateTime: string,
    endDateTime: string,
    targetTimeZone: string = 'America/Toronto',
  ): Promise<Interval[]> {
    this.ensureInitialized();
    if (!startDateTime || !endDateTime)
      throw new BadRequestException(
        'startDateTime and endDateTime are required',
      );
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
      const eventIntervals = (response.data.items || [])
        .filter((event) => event.start?.dateTime && event.end?.dateTime)
        .map((event) =>
          Interval.fromDateTimes(
            DateTime.fromISO(event.start.dateTime, {
              zone: event.start.timeZone || targetTimeZone,
            }).setZone(targetTimeZone),
            DateTime.fromISO(event.end.dateTime, {
              zone: event.end.timeZone || targetTimeZone,
            }).setZone(targetTimeZone),
          ),
        );
      return eventIntervals;
    } catch (error) {
      this.logger.error('Error in checkEventsInRange:', error.message);
      return [];
    }
  }

  /**
   * Helper privado para asegurar inicialización.
   */
  private ensureInitialized() {
    if (!this.calendar) {
      this.logger.error('Calendar client not initialized.');
      throw new InternalServerErrorException(
        'Calendar client not initialized. Check initialization logs.',
      );
    }
  }

  /**
   * Helper privado para manejo DRY de errores de Google API.
   */
  private handleGoogleApiError(error: any, contextMsg: string): never {
    this.logger.error(`${contextMsg}: ${error.message}`, error.stack);
    const googleApiError = error.response?.data?.error;
    if (googleApiError) {
      this.logger.error(
        `Google API Error: ${googleApiError.message} (Code: ${googleApiError.code})`,
      );
      if (googleApiError.code === 404) {
        throw new NotFoundException(`${contextMsg}: Not found.`);
      }
      throw new BadRequestException(`${contextMsg}: ${googleApiError.message}`);
    }
    throw new InternalServerErrorException(`${contextMsg}: ${error.message}`);
  }
}
