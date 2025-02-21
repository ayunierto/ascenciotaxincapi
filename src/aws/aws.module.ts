import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AwsController } from './aws.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AwsController],
  providers: [AwsService],
  imports: [AuthModule],
})
export class AwsModule {}
