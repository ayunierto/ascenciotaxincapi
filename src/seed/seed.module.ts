import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { ServicesModule } from 'src/services/services.module';
import { UsersModule } from 'src/users/users.module';
import { ScheduleModule } from 'src/schedule/schedule.module';
import { StaffModule } from 'src/staff/staff.module';
import { AppointmentModule } from 'src/appointment/appointment.module';
import { PostsModule } from 'src/blog/posts/posts.module';
import { CategoriesModule } from 'src/accounting/categories/categories.module';
import { SubcategoryModule } from 'src/accounting/subcategories/subcategories.module';
import { CurrencyModule } from 'src/accounting/currencies/currencies.module';
import { AccountsTypesModule } from 'src/accounting/accounts-types/account-types.module';
import { AccountModule } from 'src/accounting/accounts/accounts.module';

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
    CategoriesModule,
    SubcategoryModule,
    CurrencyModule,
    AccountsTypesModule,
    AccountModule,
  ],
})
export class SeedModule {}
