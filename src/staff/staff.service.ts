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
import { Service } from 'src/services/entities';
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

    try {
      const services = await this.serviceRepository.findBy({
        id: In(servicesIds),
      });
      const schedules = await this.scheduleRepository.findBy({
        id: In(schedulesIds),
      });
      const staff = this.staffRepository.create({
        services,
        schedules,
        ...rest,
      });

      return await this.staffRepository.save(staff);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating staff. Please try again later.',
      );
    }
  }

  async findAll() {
    try {
      return await this.staffRepository.find({
        relations: {
          services: true,
          schedules: true,
        },
      });
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while finding staff. Please try again later.',
      );
    }
  }

  async findOne(id: string) {
    try {
      const staff = await this.staffRepository.findOneBy({ id });
      if (!staff) throw new NotFoundException('Staff not found.');

      return staff;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while finding staff. Please try again later.',
      );
    }
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const {
      services: servicesIds,
      schedules: schedulesIds,
      ...rest
    } = updateStaffDto;

    try {
      const services = await this.serviceRepository.findBy({
        id: In(servicesIds),
      });
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

      return await this.staffRepository.save(staff);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating staff. Please try again later.',
      );
    }
  }

  async remove(id: string) {
    try {
      const staff = await this.findOne(id);
      return await this.staffRepository.remove(staff);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting staff. Please try again later.',
      );
    }
  }
}
