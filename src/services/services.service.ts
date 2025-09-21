import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { DataSource, In, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Service } from './entities';
import { Staff } from 'src/staff/entities/staff.entity';
import {
  CreateServiceResponse,
  DeleteServiceResponse,
  GetServiceResponse,
  GetServicesResponse,
  UpdateServiceResponse,
} from './interfaces';

@Injectable()
export class ServicesService {
  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,

    private readonly dataSource: DataSource,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
  ): Promise<CreateServiceResponse> {
    try {
      const { staff: staffIds, ...rest } = createServiceDto;

      const staff = [];
      if (staffIds && staffIds.length > 0) {
        staff.push(
          ...(await this.staffRepository.findBy({
            id: In(staffIds),
          })),
        );
      }

      const service = this.serviceRepository.create({
        staff,
        ...rest,
      });

      return await this.serviceRepository.save(service);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while creating service. Please try again later.',
      );
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<GetServicesResponse> {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const services = await this.serviceRepository.find({
        take: limit,
        skip: offset,
        relations: {
          staff: true,
        },
        order: {
          id: 'ASC',
        },
      });

      const total = await this.serviceRepository.count();

      return {
        count: total,
        pages: Math.ceil(total / limit),
        services: services,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while finding services. Please try again later.',
      );
    }
  }

  async findOne(id: string): Promise<GetServiceResponse> {
    try {
      const service = await this.serviceRepository.findOne({
        where: {
          id,
        },
        relations: {
          staff: true,
        },
      });
      if (!service) throw new NotFoundException('Service not found.');

      return service;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while finding services. Please try again later.',
      );
    }
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<UpdateServiceResponse> {
    const { staff: staffIds, ...rest } = updateServiceDto;

    try {
      const staff: Staff[] = [];
      if (staffIds && staffIds.length > 0) {
        staff.push(
          ...(await this.staffRepository.findBy({
            id: In(staffIds),
          })),
        );
      }

      const service = await this.serviceRepository.preload({
        id,
        staff,
        ...rest,
      });
      if (!service) throw new NotFoundException('Service not found.');

      return await this.serviceRepository.save(service);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while updating service. Please try again later.',
      );
    }
  }

  async remove(id: string): Promise<DeleteServiceResponse> {
    try {
      const service = await this.findOne(id);
      await this.serviceRepository.remove(service);
      return service;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while deleting service. Please try again later.',
      );
    }
  }
}
