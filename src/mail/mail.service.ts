import { Injectable, Logger } from '@nestjs/common';
import { SendMailOptions } from './interfaces';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
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

      this.logger.log(`Correo enviado: ${info.messageId}`);
      return info;
    } catch (error) {
      this.logger.error('Error enviando correo', error);
      throw error;
    }
  }

}
