import { Module } from '@nestjs/common';
import { StaffMembersService } from './staff-members.service';
import { StaffMembersController } from './staff-members.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StaffMember } from './entities/staff-member.entity';
import { Schedule } from 'src/bookings/schedules/entities/schedule.entity';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
import { Service } from '../services/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([StaffMember, Service, Schedule]),
    AuthModule,
    UsersModule,
  ],
  controllers: [StaffMembersController],
  providers: [StaffMembersService],
  exports: [StaffMembersService, TypeOrmModule],
})
export class StaffMembersModule {}
