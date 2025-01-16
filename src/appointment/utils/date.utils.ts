import { Injectable } from '@nestjs/common';
import { DateTime, Settings } from 'luxon';

@Injectable()
export class DateUtils {
  /**
   * Converts a time string in the format "HH:MM:SS" to the total number of minutes in the day.
   *
   * @param hour - The time string to convert, in the format "HH:MM:SS".
   * @returns The total number of minutes in the day corresponding to the given time.
   */
  convertTimeToMinutesOfDay = (time: string): number => {
    const [hours, minutes, second] = time.split(':').map(Number);
    return hours * 60 + minutes + second / 60;
  };

  /**
   * Checks if a given time is within a specified range.
   *
   * @param time - The time to check, in the format "HH:MM:SS".
   * @param startTime - The start time of the range, in the format "HH:MM:SS".
   * @param endTime - The end time of the range, in the format "HH:MM:SS".
   * @returns `true` if the time is within the range, `false` otherwise.
   *
   * If the start time is greater than the end time, the range is considered to
   * cross midnight. In this case, the function will return `true` if the time
   * is either greater than or equal to the start time, or less than or equal to
   * the end time.
   */
  checkIfTimeIsInRange(time: string, startTime: string, endTime: string) {
    const timeInMinutes = this.convertTimeToMinutesOfDay(time);
    const startTimeInMinutes = this.convertTimeToMinutesOfDay(startTime);
    const endTimeInMinutes = this.convertTimeToMinutesOfDay(endTime);

    if (startTimeInMinutes > endTimeInMinutes) {
      // Rango cruza la medianoche
      return (
        timeInMinutes >= startTimeInMinutes || timeInMinutes <= endTimeInMinutes
      );
    }
    return (
      timeInMinutes >= startTimeInMinutes && timeInMinutes <= endTimeInMinutes
    );
  }

  /**
   * Converts an ISO 8601 date string to the local time in Toronto and returns the time in 'HH:mm:ss' format.
   *
   * @param {string} fechaISO - The ISO 8601 date string to be converted.
   * @returns {string | null} - The time in Toronto in 'HH:MM:SS' format, or null if the input date is invalid.
   *
   *
   * @throws {Error} - If an error occurs during the date processing.
   */
  convertToIso8601ToToronto(fechaISO: string): string | null {
    try {
      // Establish the default time zone to UTC so that Datetime.Fromiso () Do not use the local time zone.
      Settings.defaultZone = 'utc';

      const fechaUTC = DateTime.fromISO(fechaISO);

      if (!fechaUTC.isValid) {
        console.error('INVALID ISO DATE:', fechaUTC.invalidReason);
        return null;
      }

      const torontoDate = fechaUTC.setZone('America/Toronto'); // Convierte a la zona horaria de Toronto

      return new Date(torontoDate.toISO()).toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }); // Devuelve la hora en Toronto
    } catch (error) {
      console.error('Error when processing the date:', error);
      return null;
    } finally {
      Settings.defaultZone = undefined; // Restore the default time zone.
    }
  }
}
