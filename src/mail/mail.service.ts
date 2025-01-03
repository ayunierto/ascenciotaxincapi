import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { SendMailDto } from './dto/send-mail.dto';

@Injectable()
export class MailService {
  sendMail(sendMail: SendMailDto) {
    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs
    // const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: 'ayunierto@gmail.com', // Change to your recipient
      from: 'ascenciotaxinc@gmail.com', // Change to your verified sender
      subject: `Appointment: ${sendMail.serviceName}`,
      text: 'Ascecncio Tax Inc Team',
      html: this.template(sendMail),
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent');
      })
      .catch((error) => {
        console.error(error);
      });
  }

  template(sendMail: SendMailDto) {
    const {
      clientName,
      staffName,
      appointmentDate,
      appointmentTime,
      location,
      serviceName,
    } = sendMail;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Appointment Confirmation</title>
    </head>
    <body style="font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Thanks for booking</h1>
            <p style="margin-bottom: 10px;">Dear <strong style="font-weight: bold;">${clientName}</strong>,</p>
            <p style="margin-bottom: 10px;">Your appointment with <strong style="font-weight: bold;">${staffName}</strong> has been confirmed.</p>
            <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                <h2 style="margin-top: 0; font-size: 1.2em; color: #555;">Appointment Details:</h2>
                <ul style="list-style-type: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;">Date:</strong> ${appointmentDate}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;">Time:</strong> ${appointmentTime}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;">Service:</strong> ${serviceName}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;">Location:</strong> ${location}</li>
                </ul>
            </div>
            <p style="margin-bottom: 10px;">We look forward to seeing you!</p>
            <p style="margin-bottom: 0;">Best regards,<br><strong style="font-weight: bold;">Ascencio Tax Inc team.</strong></p>
        </div>
    </body>
    </html>
    `;
  }
}
