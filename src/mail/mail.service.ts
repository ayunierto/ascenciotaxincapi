import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor() {
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!sendgridApiKey) {
      console.error('SENDGRID_API_KEY is not configured.');
    } else {
      sgMail.setApiKey(sendgridApiKey);
    }
  }

  /**
   * Sends an email using SendGrid.
   * It receives all necessary email data.
   * @param mailOptions - SendGrid email data (to, subject, html, text, from, etc.)
   * @returns A Promise that resolves when the email is sent/queued by SendGrid.
   */
  async sendEmail(mailOptions: sgMail.MailDataRequired): Promise<void> {
    try {
      this.logger.log(
        `Attempting to send email to: ${mailOptions.to} with subject: ${mailOptions.subject}`,
      );

      const [response] = await sgMail.send(mailOptions);

      this.logger.log(
        `Email sent successfully to ${mailOptions.to}. Status Code: ${response.statusCode}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}`);
      console.error(`Failed to send email to ${mailOptions.to}:`, error);
      if (error.response && error.response.body) {
        console.error('SendGrid Error Body:', error.response.body);
      }
      throw new InternalServerErrorException(
        `Failed to send email: ${error.message || 'Unknown SendGrid error'}`,
      );
    }
  }
}
