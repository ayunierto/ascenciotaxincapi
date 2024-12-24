import {
  BadRequestException,
  HttpException,
  HttpStatus,
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
  private readonly logger = new Logger('StaffService');

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

    // Get services
    const services = await this.serviceRepository.findBy({
      id: In(servicesIds),
    });
    // Get schedules
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
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const staff = await this.findOne(id);
    await this.staffRepository.remove(staff);
    return staff;
  }

  // Handle Errors
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs.',
    );
  }

  async removeAll() {
    const query = this.staffRepository.createQueryBuilder('staff');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Can not delete staff members',
          error: 'Can not delete staff members',
          cause: 'Unknown',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
