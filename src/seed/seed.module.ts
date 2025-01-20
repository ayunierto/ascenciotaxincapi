import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { StaffModule } from 'src/staff/staff.module';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { PostsModule } from 'src/blog/posts/posts.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ServicesModule,
    UsersModule,
    ScheduleModule,
    StaffModule,
    AppointmentModule,
    PostsModule,
  ],
})
export class SeedModule {}
