import { Injectable, Logger } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { SendMailOptions } from './interfaces';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private mailerSend: MailerSend;
  private apiKey: string;
  private senderEmail: string;
  private senderName: string;
  private sentFrom: Sender;

  constructor() {
    this.apiKey = process.env.POSTMARK_API_KEY;
    if (!this.apiKey) {
      this.logger.error('MAILERSEND_API_KEY is not configured.');
      return;
    }
    this.senderEmail = process.env.POSTMARK_SENDER_EMAIL;
    if (!this.senderEmail) {
      this.logger.error('POSTMARK_SENDER_EMAIL is not configured.');
    }
    this.senderName = process.env.POSTMARK_SENDER_NAME || 'Your App Name';

    this.mailerSend = new MailerSend({ apiKey: this.apiKey });
    this.sentFrom = new Sender(this.senderEmail, this.senderName);
  }

  async sendEmail(mailOptions: SendMailOptions): Promise<void> {
    try {
      const recipients = [
        new Recipient(mailOptions.to, mailOptions.clientName),
      ];

      const emailParams = new EmailParams()
        .setFrom(this.sentFrom)
        .setTo(recipients)
        .setReplyTo(this.sentFrom)
        .setSubject(mailOptions.subject)
        .setHtml(mailOptions.html)
        .setText(mailOptions.text);

      await this.mailerSend.email.send(emailParams);
      this.logger.log(`Email sent to: ${mailOptions.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${mailOptions.to}: ${error.message}`,
      );
      console.error(error);
    }
  }
}
