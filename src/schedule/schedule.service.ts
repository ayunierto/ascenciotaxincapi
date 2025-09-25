import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto): Promise<Schedule> {
    try {
      const schedule = this.scheduleRepository.create(createScheduleDto);

      return await this.scheduleRepository.save(schedule);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while creating schedule. Please try again later.',
      );
    }
  }

  async findAll(): Promise<Schedule[]> {
    try {
      return await this.scheduleRepository.find({
        order: { dayOfWeek: 'ASC' },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching schedule. Please try again later.',
      );
    }
  }

  async findOne(id: string): Promise<Schedule> {
    try {
      const schedule = await this.scheduleRepository.findOneBy({ id });
      if (!schedule) throw new NotFoundException();

      return schedule;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while finding schedule. Please try again later.',
      );
    }
  }

  async update(
    id: string,
    updateScheduleDto: UpdateScheduleDto,
  ): Promise<Schedule> {
    try {
      const schedule = await this.findOne(id);
      const updatedSchedule = this.scheduleRepository.merge(
        schedule,
        updateScheduleDto,
      );
      const result = await this.scheduleRepository.save(updatedSchedule);
      return result;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async remove(id: string): Promise<Schedule> {
    try {
      const schedule = await this.findOne(id);
      await this.scheduleRepository.remove(schedule);
      return schedule;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
}
