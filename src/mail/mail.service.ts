import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { SendMailOptions } from './interfaces';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private mailerSend

  constructor() {
    const apiKey = process.env.POSTMARK_API_KEY;

    if (!apiKey) {
      this.logger.error('POSTMARK_API_KEY is not configured.');
    } else {
      this.mailerSend = new MailerSend({
        apiKey,
      });
      this.logger.log('MailerSend initialized successfully.');
    }
  }

  async sendEmail(mailOptions: SendMailOptions): Promise<void> {
    try {
      const sentFrom = new Sender(
        mailOptions.from.email,
        mailOptions.from.name,
      );

      this.logger.log(
        `Attempting to send email to: ${mailOptions.to} with subject: ${mailOptions.subject}`,
      );
      
      const recipients = [
        new Recipient(mailOptions.to, mailOptions.clientName ||  "Client"),
      ];

      const emailParams = new EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setReplyTo(sentFrom)
        .setSubject(mailOptions.subject)
        .setHtml(mailOptions.html)
        .setText(mailOptions.text);

      await this.mailerSend.email.send(emailParams);

      this.logger.log(`Email sent successfully to ${mailOptions.to}}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}`);
      console.error(`Failed to send email to ${mailOptions.to}:`, error);
      if (error.response && error.response.body) {
        console.error('MailService Error Body:', error.response.body);
      }
      throw new InternalServerErrorException(
        `Failed to send email: ${error.message || 'Unknown MailService error'}`,
      );
    }
  }
}
