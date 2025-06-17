import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Staff } from 'src/staff/entities/staff.entity';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(Service.name);

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createServiceDto: CreateServiceDto) {
    try {
      const { staff: staffIds, ...rest } = createServiceDto;

      const staff = await this.staffRepository.findBy({
        id: In(staffIds),
      });

      const service = this.serviceRepository.create({
        staff,
        ...rest,
      });
      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'The service could not be created. ',
      );
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const services = await this.serviceRepository.find({
      take: limit,
      skip: offset,
      relations: {
        staff: true,
      },
      order: {
        name: 'ASC',
      },
    });

    return services;
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOne({
      where: {
        id,
      },
      relations: {
        staff: true,
      },
    });
    if (!service) throw new NotFoundException();

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto) {
    const { staff, ...rest } = updateServiceDto;

    try {
      const dbStaff = await this.staffRepository.findBy({
        id: In(staff),
      });
      const service = await this.serviceRepository.preload({
        id,
        staff: dbStaff,
        ...rest,
      });
      if (!service) throw new NotFoundException(`Service not found`);

      await this.serviceRepository.save(service);
      return this.findOne(id);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'The service could not be updated.',
      );
    }
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    return service;
  }
}
