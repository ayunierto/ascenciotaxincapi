import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { SendMailOptions } from 'src/mail/interfaces';

@Injectable()
export class NodeMailerService {
  private readonly logger = new Logger(NodeMailerService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',

      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendMail(mailOptions: SendMailOptions) {
    try {
      const info = await this.transporter.sendMail({
        from: `"Mi App" <${process.env.EMAIL_USER}>`,
        to: mailOptions.to,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
      });

      this.logger.log(`Email send: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error sending email', error);
      throw error;
    }
  }
}
