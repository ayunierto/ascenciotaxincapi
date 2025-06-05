import { Injectable, Logger } from '@nestjs/common';
import { MailerSend, EmailParams, Sender, Recipient } from 'mailersend';
import { SendMailOptions } from './interfaces';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private mailersend: MailerSend;
  private senderEmail: string;
  private senderName: string;
  private sentFrom: Sender;
  private sentReplyTo: Sender;

  constructor() {
    const apiKey = process.env.MAILERSEND_API_KEY;
    if (!apiKey) {
      throw new Error('MAILERSEND_API_KEY is not configured.');
    }

    this.senderEmail = process.env.MAILERSEND_SENDER_EMAIL;
    if (!this.senderEmail) {
      throw new Error('MAILERSEND_SENDER_EMAIL is not configured.');
    }

    const senderEmailReplyTo = process.env.MAILERSEND_SENDER_EMAIL_REPLY_TO;
    if (!senderEmailReplyTo) {
      throw new Error('MAILERSEND_SENDER_EMAIL_REPLY_TO is not configured.');
    }

    this.senderName =
      process.env.MAILERSEND_SENDER_NAME ||
      'Configure Your App Name in .env MAILERSEND_SENDER_NAME file';

    this.mailersend = new MailerSend({
      apiKey: apiKey,
    });

    this.sentFrom = new Sender(this.senderEmail, this.senderName);
    this.sentReplyTo = new Sender(senderEmailReplyTo, this.senderName);
  }

  async sendEmail(mailOptions: SendMailOptions): Promise<void> {
    if (!this.mailersend || !this.sentFrom) {
      this.logger.error(
        'MailerSend or Sender is not initialized. Check .env configuration.',
      );
      return;
    }
    try {
      const recipients = [
        new Recipient(mailOptions.to, mailOptions.clientName || mailOptions.to),
      ];

      const emailParams = new EmailParams()
        .setFrom(this.sentFrom)
        .setTo(recipients)
        .setReplyTo(this.sentReplyTo)
        .setSubject(mailOptions.subject)
        .setHtml(mailOptions.html)
        .setText(mailOptions.text);

      await this.mailersend.email.send(emailParams);
      this.logger.log(`Email sent to: ${mailOptions.to}`);
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${mailOptions.to}: ${error.message}`,
      );
      console.error(error);
    }
  }
}
