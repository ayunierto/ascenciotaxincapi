import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { In, Repository } from 'typeorm';
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
      await this.scheduleRepository.save(schedule);
      return schedule;
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    return await this.scheduleRepository.find({
      relations: {
        staff: true,
      },
    });
  }

  async findOne(id: string) {
    const schedule = await this.scheduleRepository.findOneBy({ id });
    if (!schedule) throw new NotFoundException();

    return schedule;
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
      return error;
    }
  }

  async remove(id: string) {
    const schedule = await this.findOne(id);
    await this.scheduleRepository.remove(schedule);
    return schedule;
  }
}
