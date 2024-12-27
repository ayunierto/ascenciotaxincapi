import { Module } from '@nestjs/common';
import { CalendarService } from './calendar.service';
import { CalendarController } from './calendar.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './entities/calendar.entity';

@Module({
  controllers: [CalendarController],
  providers: [CalendarService],
  imports: [TypeOrmModule.forFeature([Calendar])], // <- Add this line
  exports: [CalendarService, TypeOrmModule],
})
export class CalendarModule {}
