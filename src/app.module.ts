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
import { AppointmentsModule } from './appointment/appointments.module';
import { ScheduleModule } from './schedule/schedule.module';
import { CalendarModule } from './calendar/calendar.module';
import { ZoomModule } from './zoom/zoom.module';
import { MailModule } from './mail/mail.module';
import { PostsModule } from './blog/posts/posts.module';
import { CategoriesModule } from './accounting/categories/categories.module';
import { ExpenseModule } from './accounting/expenses/expenses.module';
import { TagsModule } from './accounting/tags/tags.module';
import { SubcategoriesModule } from './accounting/subcategories/subcategories.module';
import { LogsModule } from './logs/logs.module';
import { ReportsModule } from './accounting/reports/reports.module';
import { PrinterModule } from './printer/printer.module';
import { NotificationModule } from './notification/notification.module';
import { SettingsModule } from './settings/settings.module';
import { AvailabilityModule } from './availability/availability.module';
import { OpenaiModule } from './openai/openai.module';
import { OcrModule } from './ocr/ocr.module';
import { AppVersionsModule } from './app-versions/app-versions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        `.env.${process.env.STAGE}`,
        '.env', // fallback
      ],
    }),
    TypeOrmModule.forRoot({
      ssl:
        process.env.STAGE !== 'development'
          ? { rejectUnauthorized: false }
          : false,

      type: 'postgres',
      url: process.env.DB_URL,
      // host: process.env.DB_HOST,
      // port: +process.env.DB_PORT,
      // database: process.env.DB_NAME,
      // username: process.env.DB_USERNAME,
      // password: process.env.DB_PASSWORD,
      autoLoadEntities: process.env.STAGE === 'development' ? true : false,
      synchronize: process.env.STAGE === 'development' ? true : false,
    }),
    AuthModule,
    ServicesModule,
    CommonModule,
    UsersModule,
    SeedModule,
    FilesModule,
    StaffModule,
    AppointmentsModule,
    ScheduleModule,
    CalendarModule,
    ZoomModule,
    MailModule,
    PostsModule,
    CategoriesModule,
    ExpenseModule,
    TagsModule,
    SubcategoriesModule,
    LogsModule,
    ReportsModule,
    PrinterModule,
    NotificationModule,
    SettingsModule,
    AvailabilityModule,
    OpenaiModule,
    OcrModule,
    AppVersionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
