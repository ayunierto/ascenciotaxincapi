import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service, ServiceImage } from './entities/';
import { AuthModule } from 'src/auth/auth.module';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [
    TypeOrmModule.forFeature([Service, ServiceImage, Staff, Appointment]),
    AuthModule,
  ],
  exports: [ServicesService, TypeOrmModule],
})
export class ServicesModule {}
