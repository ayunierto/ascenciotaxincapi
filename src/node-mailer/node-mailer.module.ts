import { Module } from '@nestjs/common';
import { NodeMailerService } from './node-mailer.service';

@Module({
  providers: [NodeMailerService],
  exports: [NodeMailerService],
})
export class NodeMailerModule {}
