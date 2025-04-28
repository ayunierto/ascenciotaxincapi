import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ServicesModule } from './services/services.module';
import { CommonModule } from './common/common.module';
import { UsersModule } from './users/users.module';
import { SeedModule } from './seed/seed.module';
import { FilesModule } from './files/files.module';
import { StaffModule } from './staff/staff.module';
import { AppointmentModule } from './appointment/appointment.module';
import { ScheduleModule } from './schedule/schedule.module';
import { AvailabilityModule } from './availability/availability.module';
import { CalendarModule } from './calendar/calendar.module';
import { ZoomModule } from './zoom/zoom.module';
import { MailModule } from './mail/mail.module';
import { PostsModule } from './blog/posts/posts.module';

import { CategoriesModule } from './accounting/categories/categories.module';
import { IncomeModule } from './accounting/incomes/incomes.module';
import { ExpenseModule } from './accounting/expenses/expenses.module';
import { AccountModule } from './accounting/accounts/accounts.module';
import { TagsModule } from './accounting/tags/tags.module';
import { SubcategoryModule } from './accounting/subcategories/subcategories.module';
import { AccountsTypesModule } from './accounting/accounts-types/accounts-types.module';
import { CurrencyModule } from './accounting/currencies/currencies.module';
import { LogsModule } from './logs/logs.module';
import { AwsModule } from './aws/aws.module';
import { ReportsModule } from './accounting/reports/reports.module';
import { PrinterModule } from './printer/printer.module';
import { NotificationModule } from './notification/notification.module';
import { TwilioModule } from './twilio/twilio.module';
import { UtilityModule } from './utility/utility.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE !== 'dev' ? { rejectUnauthorized: false } : false,

      type: 'postgres',
      url: process.env.DB_URL,
      // host: process.env.DB_HOST,
      // port: +process.env.DB_PORT,
      // database: process.env.DB_NAME,
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    ServicesModule,
    CommonModule,
    UsersModule,
    SeedModule,
    FilesModule,
    StaffModule,
    AppointmentModule,
    ScheduleModule,
    AvailabilityModule,
    CalendarModule,
    ZoomModule,
    MailModule,
    PostsModule,
    CategoriesModule,
    IncomeModule,
    ExpenseModule,
    AccountModule,
    TagsModule,
    SubcategoryModule,
    AccountsTypesModule,
    CurrencyModule,
    LogsModule,
    AwsModule,
    ReportsModule,
    PrinterModule,
    NotificationModule,
    TwilioModule,
    UtilityModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
