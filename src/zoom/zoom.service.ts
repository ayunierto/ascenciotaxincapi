import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class ZoomService {
  private ZOOM_OAUTH_ENDPOINT = 'https://zoom.us/oauth/token';
  private ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

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

      console.log('Meeting created.');
      return request.data;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
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
