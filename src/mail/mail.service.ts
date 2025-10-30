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
      this.logger.error(
        'MAILERSEND_API_KEY is not configured. Please set it in your environment variables.',
      );
      throw new Error('MAILERSEND_API_KEY is not configured.');
    }

    this.senderEmail = process.env.MAILERSEND_SENDER_EMAIL;
    if (!this.senderEmail) {
      this.logger.error(
        'MAILERSEND_SENDER_EMAIL is not configured. Please set it in your environment variables.',
      );
      throw new Error('MAILERSEND_SENDER_EMAIL is not configured.');
    }

    const senderEmailReplyTo = process.env.MAILERSEND_SENDER_EMAIL_REPLY_TO;
    if (!senderEmailReplyTo) {
      this.logger.error(
        'MAILERSEND_SENDER_EMAIL_REPLY_TO is not configured. Please set it in your environment variables.',
      );
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

  async sendMail(mailOptions: SendMailOptions): Promise<boolean> {
    if (!this.mailersend || !this.sentFrom) {
      this.logger.error(
        'MailerSend or Sender is not initialized. Check .env configuration.',
      );
      return false;
    }

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

    try {
      await this.mailersend.email.send(emailParams);
      this.logger.log(`Email sent successful to: ${mailOptions.to}`);
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${mailOptions.to}: ${error.message}`,
      );
      console.error(error);
      return false;
    }
  }
}
