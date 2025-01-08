import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';
import { SendMailDto } from './dto/send-mail.dto';
import { SendMailVerificationCodeDto } from './dto/send-mail-verification-code.dto';

@Injectable()
export class MailService {
  sendMail(sendMail: SendMailDto) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: sendMail.to,
      from: 'ascenciotaxinc@gmail.com',
      subject: `Appointment: ${sendMail.serviceName}`,
      text: 'Ascencio Tax Inc Team',
      html: this.templateAppointmentConfirmation(sendMail),
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log(`Email sent to: ${sendMail.to}`);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  sendMailStaff(sendMail: SendMailDto) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: sendMail.to,
      from: 'ascenciotaxinc@gmail.com',
      subject: `Appointment: ${sendMail.serviceName} con ${sendMail.staffName}`,
      text: 'Ascencio Tax Inc Team',
      html: this.templateAppointmentConfirmationStaff(sendMail),
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log(`Email sent to: ${sendMail.to}`);
      })
      .catch((error) => {
        console.error(error);
      });
  }

  sendMailVerificationCode(
    sendMailVerificationCodeDto: SendMailVerificationCodeDto,
  ) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    const msg = {
      to: sendMailVerificationCodeDto.to,
      from: 'ascenciotaxinc@gmail.com',
      subject: 'Verification code for Ascencio Tax Inc',
      text: 'Ascencio Tax Inc Team',
      html: this.templateVerificationCode(sendMailVerificationCodeDto),
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log(
          `Verification code email sent to: ${sendMailVerificationCodeDto.to}`,
        );
      })
      .catch((error) => {
        console.error(error);
      });
  }

  templateAppointmentConfirmation(sendMail: SendMailDto) {
    const {
      clientName,
      staffName,
      appointmentDate,
      appointmentTime,
      location,
      serviceName,
      meetingLink,
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
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;"> Meeting link:</strong> ${meetingLink}</li>
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

  templateAppointmentConfirmationStaff(sendMail: SendMailDto) {
    const {
      clientName,
      staffName,
      appointmentDate,
      appointmentTime,
      location,
      serviceName,
      meetingLink,
      clientEmail,
      clientPhoneNumber,
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
            <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Appointment</h1>
            <p style="margin-bottom: 10px;">Dear <strong style="font-weight: bold;">${staffName}</strong>,</p>
            <p style="margin-bottom: 10px;">Your appointment with <strong style="font-weight: bold;">${clientName}</strong> has been confirmed.</p>
            <div style="margin-bottom: 20px; border: 1px solid #ddd; padding: 15px; border-radius: 5px;">
                <h2 style="margin-top: 0; font-size: 1.2em; color: #555;">Appointment Details:</h2>
                <ul style="list-style-type: none; padding: 0; margin: 0;">
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;">Date:</strong> ${appointmentDate}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;">Time:</strong> ${appointmentTime}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;">Service:</strong> ${serviceName}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;"> Email:</strong> ${clientEmail}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;"> Phone Number:</strong> ${clientPhoneNumber}</li>
                    <li style="margin-bottom: 5px;"><strong style="font-weight: bold;"> Meeting link:</strong> ${meetingLink}</li>
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

  templateVerificationCode(
    sendMailVerificationCodeDto: SendMailVerificationCodeDto,
  ) {
    const { clientName, verificationCode } = sendMailVerificationCodeDto;
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation code</title>
    </head>
    <body style="font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
            <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Verification code</h1>
            <p style="margin-bottom: 10px;">Dear <strong style="font-weight: bold;">${clientName}</strong>,</p>
            <p style="margin-bottom: 10px;">Your verification code for Ascencio Tax Inc is: <strong style="font-weight: bold;">${verificationCode}</strong>.</p>
            <p style="margin-bottom: 10px;">We look forward to seeing you!</p>
            <p style="margin-bottom: 0;">Best regards,<br><strong style="font-weight: bold;">Ascencio Tax Inc team.</strong></p>
        </div>
    </body>
    </html>
    `;
  }
}
