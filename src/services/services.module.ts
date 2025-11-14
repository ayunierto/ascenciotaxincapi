import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/';
import { AuthModule } from 'src/auth/auth.module';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [
    TypeOrmModule.forFeature([Service, Staff, Appointment]),
    AuthModule,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
