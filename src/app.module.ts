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

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      ssl: process.env.STAGE === 'prod' ? true : false,
      extra: {
        ssl:
          process.env.STAGE === 'prod'
            ? {
                rejectsUnauthorized: false,
              }
            : null,
      },

      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.DB_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
