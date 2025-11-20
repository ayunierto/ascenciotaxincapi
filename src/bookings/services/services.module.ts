import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/';
import { AuthModule } from 'src/auth/auth.module';
import { StaffMember } from 'src/bookings/staff-members/entities/staff-member.entity';
import { Appointment } from 'src/bookings/appointments/entities/appointment.entity';

@Module({
  controllers: [ServicesController],
  providers: [ServicesService],
  imports: [
    TypeOrmModule.forFeature([Service, StaffMember, Appointment]),
    AuthModule,
  ],
  exports: [ServicesService],
})
export class ServicesModule {}
