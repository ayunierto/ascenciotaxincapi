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
      const { staff_ids, ...rest } = createServiceDto;

      const staff = [];
      if (staff_ids && staff_ids.length > 0) {
        staff.push(
          ...(await this.staffRepository.findBy({
            id: In(staff_ids),
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

  async findAll(
    paginationDto: PaginationDto,
    lang: 'es' | 'en' = 'es',
  ): Promise<GetServicesResponse> {
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
        services: services.map((service) => {
          return {
            ...service,
            title: lang === 'es' ? service.title_es : service.title_en,
            description:
              lang === 'es' ? service.description_es : service.description_en,
          };
        }),
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
    const { staff_ids, ...rest } = updateServiceDto;

    try {
      const staff: Staff[] = [];
      if (staff_ids && staff_ids.length > 0) {
        staff.push(
          ...(await this.staffRepository.findBy({
            id: In(staff_ids),
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
