import { Injectable, InternalServerErrorException } from '@nestjs/common';
import sgMail from '@sendgrid/mail';

import { MailService } from 'src/mail/mail.service';
import { TwilioService } from '../twilio/twilio.service';
import { AppointmentDetailsDto } from './dto/appointment-details.dto';

@Injectable()
export class NotificationService {
  private senderEmail: string;
  private senderName: string; // Optional: Sender name

  constructor(
    private readonly mailService: MailService,
    private readonly twilioService: TwilioService,
  ) {
    this.senderEmail = process.env.MAIL_FROM_ADDRESS;
    this.senderName = process.env.MAIL_FROM_NAME || 'Your App Name'; // Default sender name if not configured

    if (!this.senderEmail) {
      console.error('MAIL_FROM_ADDRESS is not configured.');
      // Decide on error handling if sender email is missing
      throw new InternalServerErrorException(
        'Email service not configured. Please set MAIL_FROM_ADDRESS in environment variables.',
      );
    }
  }

  /**
   * Sends the email verification code notification.
   * @param recipientEmail The email address to send to.
   * @param code The verification code.
   * @returns A Promise.
   */
  async sendEmailVerificationCode(
    clientName: string,
    recipientEmail: string,
    code: string,
  ): Promise<void> {
    if (!this.senderEmail) {
      console.error(
        'Cannot send verification email: Sender address not configured.',
      );
      throw new InternalServerErrorException('Email service not configured.');
    }

    const subject = 'Verify Your Email Address'; // Subject

    // --- Compose HTML Body for Email Verification ---
    // You can load this from an HTML file template for better organization
    const htmlBody = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmation code</title>
      </head>
      <body style="font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
              <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Verification code</h1>
              <p style="margin-bottom: 10px;">Hello <strong style="font-weight: bold;">${clientName}</strong>,</p>
              <p style="margin-bottom: 10px;">Thank you for signing up! Please verify your email address by using the code below:</p>
              <p style="margin-bottom: 10px;">Your verification code for Ascencio Tax Inc is: <strong style="font-weight: bold;">${code}</strong>.</p>
              <p style="margin-bottom: 10px;">This code is valid for a limited time.</p>
              <p style="margin-bottom: 10px;">If you did not create an account, please ignore this email.</p>
              <p style="margin-bottom: 10px;">We look forward to seeing you!</p>
              <p style="margin-bottom: 0;">Best regards,<br><strong style="font-weight: bold;">${this.senderName}</strong></p>
          </div>
      </body>
      </html>
    `;
    // --- End of HTML Body ---

    const textBody = `
      Hello ${clientName},
      Thank you for signing up! Please verify your email address by using the code below:
      Your Verification Code: ${code}
      This code is valid for a limited time.
      If you did not create an account, please ignore this email.

      Best regards,
      ${this.senderName}
    `;

    const mailOptions: sgMail.MailDataRequired = {
      to: recipientEmail,
      from: { email: this.senderEmail, name: this.senderName }, // Using object for sender name
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      // Delegate the actual sending to the MailService
      await this.mailService.sendEmail(mailOptions);
    } catch (error) {
      console.error(
        `Failed to send email verification to ${recipientEmail}:`,
        error,
      );
      // Decide if you want to re-throw or handle differently
      // For signup, a failed email might mean the user can't verify, so re-throwing might be appropriate
      throw error; // Re-throw the MailService error
    }
  }

  /**
   * Sends the password reset code notification.
   * @param recipientEmail The email address to send to.
   * @param code The password reset code.
   * @returns A Promise.
   */
  async sendPasswordResetCodeEmail(
    clientName: string,
    recipientEmail: string,
    code: string,
  ): Promise<void> {
    if (!this.senderEmail) {
      console.error(
        'Cannot send password reset email: Sender address not configured.',
      );
      throw new InternalServerErrorException('Email service not configured.');
    }

    const subject = 'Your Password Reset Code'; // Subject

    // --- Compose HTML Body for Password Reset Code ---
    // Load from template file
    const htmlBody = `
       <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Confirmation code</title>
        </head>
        <body style="font-family: sans-serif; margin: 20px; background-color: #f4f4f4; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #007bff; margin-bottom: 20px; text-align: center;">Password Reset</h1>
                <p style="margin-bottom: 10px;">Hello <strong style="font-weight: bold;">${clientName}</strong>,</p>
                <p style="margin-bottom: 10px;">We received a request to reset the password for your account.</p>
                <p style="margin-bottom: 10px;">Your password reset code is: <strong>${code}</strong></strong>.</p>
                <p style="margin-bottom: 10px;">Please enter this code in the app to set a new password. This code is valid for a limited time.</p>
                <p style="margin-bottom: 10px;">If you did not request a password reset, please ignore this email.</p>
                <p style="margin-bottom: 0;">Best regards,<br><strong style="font-weight: bold;">${this.senderName}</strong></p>
            </div>
        </body>
        </html>

        <p>Hello,</p>
        <p>We received a request to reset the password for your account.</p>
        <p>Your password reset code is: <strong>${code}</strong></p>
        <p>Please enter this code in the app to set a new password. This code is valid for a limited time.</p>
        <br>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,</p>
        <p>${this.senderName}</p>
      `;
    // --- End of HTML Body ---

    const textBody = `
        Hello ${clientName},
        We received a request to reset the password for your account.
        Your password reset code is: ${code}
        Please enter this code in the app to set a new password. This code is valid for a limited time.
        If you did not request a password reset, please ignore this email.

        Best regards,
        ${this.senderName}
      `;

    const mailOptions: sgMail.MailDataRequired = {
      to: recipientEmail,
      from: { email: this.senderEmail, name: this.senderName },
      subject: subject,
      text: textBody,
      html: htmlBody,
    };

    try {
      // Delegate the actual sending to the MailService
      await this.mailService.sendEmail(mailOptions);
    } catch (error) {
      console.error(
        `Failed to send password reset email to ${recipientEmail}:`,
        error,
      );
      // As discussed for the forgot-password flow, we log the error but *do not re-throw*
      // to ensure the controller returns the generic success message for security.
      // The MailService already threw, so we just catch and log here.
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

    const mailOptions: sgMail.MailDataRequired = {
      to: recipientEmail,
      from: { email: this.senderEmail, name: this.senderName },
      subject: subject,
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

    const mailOptions: sgMail.MailDataRequired = {
      to: recipientEmail,
      from: { email: this.senderEmail, name: this.senderName },
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
