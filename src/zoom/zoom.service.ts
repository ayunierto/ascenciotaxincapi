import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { CreateZoomMeetingDto, UpdateZoomMeetingDto } from './dto';

@Injectable()
export class ZoomService {
  private ZOOM_OAUTH_ENDPOINT = 'https://zoom.us/oauth/token';
  private ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

  private readonly logger = new Logger(ZoomService.name);

  async createZoomMeeting(body: CreateZoomMeetingDto) {
    try {
      const token = (await this.getZoomToken()).access_token;

      const { data } = await axios.post(
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

      this.logger.log('Meeting created successfully');
      return data;
    } catch (error) {
      this.logger.error('Error creating Zoom meeting:', error);
      throw error;
    }
  }

  async updateMeeting(meetingId: string, updateData: UpdateZoomMeetingDto) {
    try {
      const token = (await this.getZoomToken()).access_token;

      this.logger.log(
        `Updating meeting ${meetingId} with data:`,
        JSON.stringify(updateData, null, 2),
      );

      const { data } = await axios.patch(
        `${this.ZOOM_API_BASE_URL}/meetings/${meetingId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`,
          },
        },
      );

      this.logger.log(`Meeting ${meetingId} updated successfully`);
      return data;
    } catch (error) {
      this.logger.error(
        `Error updating Zoom meeting ${meetingId}:`,
        error.message,
      );
      if (error.response) {
        this.logger.error(
          `Zoom API Error Response:`,
          JSON.stringify(error.response.data, null, 2),
        );
        this.logger.error(`Status: ${error.response.status}`);
      }
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const token = (await this.getZoomToken()).access_token;

      const request = await axios.delete(
        `${this.ZOOM_API_BASE_URL}/meetings/${id}`,
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
