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

      const staff = await this.staffRepository.findBy({
        id: In(staffIds),
      });
      if (!staff) throw new BadRequestException(`Provided staff  not found.`);

      const service = this.serviceRepository.create({
        staff,
        ...rest,
      });
      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating service. Please try again later.',
        'CREATE_SERVICE_FAILED',
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
          name: 'ASC',
        },
      });

      return services;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while finding services. Please try again later.',
        'GET_SERVICES_FAILED',
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
      if (!service) throw new NotFoundException();

      return service;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while finding services. Please try again later.',
        'GET_SERVICE_FAILED',
      );
    }
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<UpdateServiceResponse> {
    const { staff, ...rest } = updateServiceDto;
    const dbStaff = await this.staffRepository.findBy({
      id: In(staff),
    });
    if (!dbStaff) throw new BadRequestException('Provided staff not found');
    const service = await this.serviceRepository.preload({
      id,
      staff: dbStaff,
      ...rest,
    });
    if (!service) throw new NotFoundException(`Image not found`);

    // Create queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(service);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.serviceRepository.save(service);
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating service. Please try again later.',
        'UPDATE_SERVICE_FAILED',
      );
    }
  }

  async remove(id: string): Promise<DeleteServiceResponse> {
    try {
      const service = await this.serviceRepository.findOneBy({ id });
      if (!service)
        throw new NotFoundException(`Service with id ${id} not found`);

      await this.serviceRepository.remove(service);

      return service;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting service. Please try again later.',
        'DELETE_SERVICE_FAILED',
      );
    }
  }
}
