import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { MailModule } from 'src/mail/mail.module';

@Module({
  providers: [NotificationService],
  exports: [NotificationService],
  imports: [MailModule],
})
export class NotificationModule { }
