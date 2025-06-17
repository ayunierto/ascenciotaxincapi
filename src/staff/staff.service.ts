import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffDto } from './dto/create-staff.dto';
import { UpdateStaffDto } from './dto/update-staff.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Staff } from './entities/staff.entity';
import { In, Repository } from 'typeorm';
import { Service } from 'src/services/entities/service.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';

@Injectable()
export class StaffService {
  private readonly logger = new Logger(StaffService.name);

  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    const {
      services: servicesIds,
      schedules: schedulesIds,
      ...rest
    } = createStaffDto;

    const services = await this.serviceRepository.findBy({
      id: In(servicesIds),
    });
    const schedules = await this.scheduleRepository.findBy({
      id: In(schedulesIds),
    });

    try {
      const staff = this.staffRepository.create({
        services,
        schedules,
        ...rest,
      });
      await this.staffRepository.save(staff);
      return staff;
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    return await this.staffRepository.find({
      relations: {
        services: true,
        schedules: true,
      },
    });
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findOneBy({ id });
    if (!staff) throw new NotFoundException();

    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const {
      services: servicesIds,
      schedules: schedulesIds,
      ...rest
    } = updateStaffDto;

    // Get services
    const services = await this.serviceRepository.findBy({
      id: In(servicesIds),
    });
    // Get schedules
    const schedules = await this.scheduleRepository.findBy({
      id: In(schedulesIds),
    });

    const staff = await this.staffRepository.preload({
      id,
      services,
      schedules,
      ...rest,
    });
    if (!staff) throw new NotFoundException();
    try {
      await this.staffRepository.save(staff);
      return staff;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException();
    }
  }

  async remove(id: string) {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
    return staff;
  }
}
