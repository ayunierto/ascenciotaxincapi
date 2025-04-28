import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { TwilioModule } from 'src/twilio/twilio.module';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
  imports: [TwilioModule, MailModule],
})
export class NotificationModule {}
