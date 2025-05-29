import { Module } from '@nestjs/common';
import { AwsService } from './aws.service';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [],
  providers: [AwsService],
  imports: [AuthModule],
  exports: [AwsService],
})
export class AwsModule {}
