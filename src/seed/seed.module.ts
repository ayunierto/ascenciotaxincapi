import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { StaffModule } from 'src/staff/staff.module';
import { AppointmentsModule } from 'src/appointment/appointments.module';
import { PostsModule } from 'src/blog/posts/posts.module';
import { CategoriesModule } from 'src/accounting/categories/categories.module';
import { SubcategoriesModule } from 'src/accounting/subcategories/subcategories.module';

@Module({
  controllers: [SeedController],
  providers: [SeedService],
  imports: [
    ServicesModule,
    UsersModule,
    ScheduleModule,
    StaffModule,
    AppointmentsModule,
    PostsModule,
    CategoriesModule,
    SubcategoriesModule,
  ],
})
export class SeedModule {}
