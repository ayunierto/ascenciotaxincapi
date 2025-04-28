import { Injectable, Logger } from '@nestjs/common';
import { Twilio } from 'twilio';

@Injectable()
export class TwilioService {
  private twilioClient: Twilio;
  private twilioPhoneNumber: string;
  private readonly logger = new Logger(TwilioService.name);

  constructor() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    this.twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !this.twilioPhoneNumber) {
      this.logger.error(
        'Twilio credentials or phone number not configured in environment variables.',
      );
      // Depending on your application, you might want to throw an error here
      // or just log and ensure methods handle the lack of client.
      return; // Exit constructor if credentials are missing
    }

    this.twilioClient = new Twilio(accountSid, authToken);
    this.logger.log('Twilio client initialized.');
  }

  async sendSMSMenssage(to: string, body: string) {
    try {
      const message = await this.twilioClient.messages.create({
        body: body,
        from: this.twilioPhoneNumber,
        to: to,
      });
      this.logger.log(`Message sent: ${message.sid}`);
    } catch (error) {
      this.logger.error(`Failed to send message: ${error.message}`);
    }
  }

  async sendWhatsappMessage(code: string, phoneNumber: string) {
    await this.twilioClient.messages
      .create({
        from: 'whatsapp:+14155238886',
        contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
        contentVariables: `{"1":"${code}"}`,
        to: `whatsapp:${phoneNumber}`,
      })
      .then((message) => console.log(message))
      .catch((error) =>
        console.error('Error sending WhatsApp message:', error),
      );
  }
}
