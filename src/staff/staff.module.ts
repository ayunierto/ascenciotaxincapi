import { Module } from '@nestjs/common';
import { StaffService } from './staff.service';
import { StaffController } from './staff.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { Service } from 'src/services/entities';

@Module({
  controllers: [StaffController],
  providers: [StaffService],
  imports: [TypeOrmModule.forFeature([Staff, Service])],
  exports: [StaffService, TypeOrmModule],
})
export class StaffModule {}
