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
import { Staff } from 'src/staff/entities/staff.entity';

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(createScheduleDto: CreateScheduleDto) {
    const { staff: id, ...rest } = createScheduleDto;

    const staff = await this.staffRepository.findOneBy({
      id,
    });

    try {
      const schedule = this.scheduleRepository.create({
        staff,
        ...rest,
      });

      return await this.scheduleRepository.save(schedule);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating schedule. Please try again later.',
      );
    }
  }

  async findAll() {
    try {
      return await this.scheduleRepository.find({
        relations: {
          staff: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching schedule. Please try again later.',
      );
    }
  }

  async findOne(id: string) {
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

  async update(id: string, updateScheduleDto: UpdateScheduleDto) {
    const { staff, ...rest } = updateScheduleDto;

    const dbStaff = await this.staffRepository.findOneBy({
      id: staff,
    });

    const schedule = await this.scheduleRepository.preload({
      id,
      staff: dbStaff,
      ...rest,
    });
    if (!staff) throw new NotFoundException();
    try {
      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating schedule. Please try again later.',
      );
    }
  }

  async remove(id: string) {
    try {
      const schedule = await this.scheduleRepository.findOneBy({ id });
      return await this.scheduleRepository.remove(schedule);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting schedule. Please try again later.',
      );
    }
  }
}
