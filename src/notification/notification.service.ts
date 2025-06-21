import { Injectable, Logger } from '@nestjs/common';
import { MailService } from 'src/mail/mail.service';
import { AppointmentDetailsDto } from './dto/appointment-details.dto';
import { SendMailOptions } from 'src/mail/interfaces';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private senderName: string;

  constructor(private readonly mailService: MailService) {
    this.senderName = process.env.MAILERSEND_SENDER_NAME;
    if (!this.senderName)
      this.logger.error('MAILERSEND_SENDER_NAME is not configured.');
  }

  async sendVerificationEmail(
    clientName: string,
    recipientEmail: string,
    code: string,
    expirationTime: number,
  ): Promise<boolean> {
    const subject = 'Verify Your Email Address';

    const htmlBody = `
      <body style="font-family: sans-serif; margin: 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Verification code</h1>
              <p style="margin-bottom: 10px;">Hello <strong style="font-weight: bold;">${clientName}</strong>,</p>
              <p style="margin-bottom: 10px;">Thank you for signing up! Please verify your email address by using the code below:</p>
              <p style="margin-bottom: 10px;">Your verification code for ${this.senderName} is: <strong style="font-weight: bold;">${code}</strong>.</p>
              <p style="margin-bottom: 10px;">Your code is valid for ${expirationTime} minutes.</p>
              <p style="margin-bottom: 10px;">If you did not create an account, please ignore this email.</p>
              <p style="margin-bottom: 10px;">We look forward to seeing you!</p>
              <p style="margin-bottom: 0;">Best regards,<br><strong style="font-weight: bold;">${this.senderName}</strong></p>
          </div>
      </body>
    `;

    const textBody = `
      Hello ${clientName},
      Thank you for signing up! Please verify your email address by using the code below:
      Your Verification Code: ${code}
      Your code is valid for ${expirationTime} minutes.
      If you did not create an account, please ignore this email.

      Best regards,
      ${this.senderName}
    `;

    const mailOptions: SendMailOptions = {
      clientName: clientName,
      to: recipientEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      await this.mailService.sendEmail(mailOptions);
      this.logger.log(
        `Verification email sent successfully to: ${recipientEmail}`,
      );
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send email verification to: ${recipientEmail}: ${error.message}`,
      );
      return false;
    }
  }

  async sendResetPasswordEmail(
    clientName: string,
    recipientEmail: string,
    code: string,
    expirationTime: number,
  ): Promise<boolean> {
    const subject = 'Password Reset Code';
    const htmlBody = `
      <body style="font-family: sans-serif; margin: 20px; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Password Reset</h1>
              <p style="margin-bottom: 10px;">Hello <strong style="font-weight: bold;">${clientName}</strong>,</p>
              <p style="margin-bottom: 10px;">We received a request to reset the password for your account.</p>
              <p style="margin-bottom: 10px;">Your password reset code is: <strong>${code}</strong>.</p>
              <p style="margin-bottom: 10px;">Your code is valid for ${expirationTime} minutes.</p>
              <p style="margin-bottom: 10px;">Please enter this code in the app to set a new password. This code is valid for a limited time.</p>
              <p style="margin-bottom: 10px;">If you did not request a password reset, please ignore this email.</p>
              <p style="margin-bottom: 10px;">Best regards,<br><strong style="font-weight: bold;">${this.senderName}</strong></p>
          </div>
      </body>
      `;
    const textBody = `
      Hello ${clientName},
      We received a request to reset the password for your account.
      Your password reset code is: ${code}
      Your code is valid for ${expirationTime} minutes.
      Please enter this code in the app to set a new password. This code is valid for a limited time.
      If you did not request a password reset, please ignore this email.

      Best regards,
      ${this.senderName}
    `;

    const mailOptions: SendMailOptions = {
      clientName: clientName,
      to: recipientEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      await this.mailService.sendEmail(mailOptions);
      this.logger.log('Password reset email sended.');
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${recipientEmail}: ${error.message}`,
      );
      return false;
    }
  }

  async sendAppointmentConfirmationEmailToClient(
    recipientEmail: string,
    appointmentDetails: AppointmentDetailsDto,
  ): Promise<void> {
    const subject = 'Appointment Confirmation';
    const {
      clientName,
      staffName,
      appointmentDate,
      appointmentTime,
      location,
      serviceName,
      meetingLink,
    } = appointmentDetails;
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Appointment Confirmation</title>
      </head>
      <body style="font-family: sans-serif; margin: 20px; color: #333;">
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
              <p style="margin-bottom: 0;">Best regards,<br><strong style="font-weight: bold;">${this.senderName} team.</strong></p>
          </div>
      </body>
      </html>
      `;

    const textBody = `
        Thanks for booking,
        Appointment Details:
        Date: ${appointmentDate}
        Time: ${appointmentTime}
        Service: ${serviceName}
        Meeting link: ${meetingLink}
        Location: ${location}
        We look forward to seeing you!
        Best regards,
        ${this.senderName}
      `;

    const mailOptions: SendMailOptions = {
      clientName: clientName,

      to: recipientEmail,
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      await this.mailService.sendEmail(mailOptions);
    } catch (error) {
      console.error(
        `Failed to send appointment confirmation email to ${recipientEmail}:`,
        error,
      );
      // Handle the error as needed
    }
  }

  async sendAppointmentConfirmationEmailToStaff(
    recipientEmail: string,
    appointmentDetails: AppointmentDetailsDto,
  ): Promise<void> {
    const {
      clientName,
      clientEmail,
      clientPhoneNumber,
      staffName,
      appointmentDate,
      appointmentTime,
      location,
      serviceName,
      meetingLink,
    } = appointmentDetails;

    const htmlBody = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Appointment Confirmation</title>
        </head>
        <body style="font-family: sans-serif; margin: 20px; color: #333;">
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
                <p style="margin-bottom: 0;">Best regards,<br><strong style="font-weight: bold;">${this.senderName} team.</strong></p>
            </div>
        </body>
        </html>
    `;

    const textBody = `
        Appointment Details:
        Date: ${appointmentDate}
        Time: ${appointmentTime}
        Service: ${serviceName}
        Email: ${clientEmail}
        Phone Number: ${clientPhoneNumber}
        Meeting link: ${meetingLink}
        Location: ${location}
        We look forward to seeing you!
        Best regards,
        ${this.senderName}
      `;

    const mailOptions: SendMailOptions = {
      clientName: clientName,

      to: recipientEmail,
      subject: 'Appointment Confirmation',
      text: textBody,
      html: htmlBody,
    };

    try {
      await this.mailService.sendEmail(mailOptions);
      console.log(`Appointment confirmation email sent to ${recipientEmail}`);
    } catch (error) {
      console.error(
        `Failed to send appointment confirmation email to ${recipientEmail}:`,
        error,
      );
      // Handle the error as needed
    }
  }

  // Add other notification methods as needed, e.g.,
  // async sendPasswordChangedConfirmation(recipientEmail: string): Promise<void> { ... }
}
