import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from 'src/bookings/schedules/schedule.module';
import { StaffMembersModule } from 'src/bookings/staff-members/staff-members.module';
import { AppointmentsModule } from 'src/bookings/appointments/appointments.module';
import { PostsModule } from 'src/blog/posts/posts.module';
import { CategoriesModule } from 'src/accounting/categories/categories.module';
import { SubcategoriesModule } from 'src/accounting/subcategories/subcategories.module';
import { SettingsModule } from 'src/settings/settings.module';
import { AppVersionsModule } from 'src/app-versions/app-versions.module';
import { ServicesModule } from 'src/bookings/services/services.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ServicesModule,
    UsersModule,
    ScheduleModule,
    StaffMembersModule,
    AppointmentsModule,
    PostsModule,
    CategoriesModule,
    SubcategoriesModule,
    SettingsModule,
    AppVersionsModule,
  ],
})
export class SeedModule {}
