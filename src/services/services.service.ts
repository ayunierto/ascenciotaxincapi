import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import { ServiceImage, Service } from './entities';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger('ServicesService');

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(ServiceImage)
    private readonly serviceImageRepository: Repository<ServiceImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createServiceDto: CreateServiceDto, user: User) {
    try {
      const { images = [], ...productsRest } = createServiceDto;

      const service = this.serviceRepository.create({
        ...productsRest,
        user,
        images: images.map((img) =>
          this.serviceImageRepository.create({ url: img }),
        ),
      });
      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const services = await this.serviceRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return services;
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) throw new NotFoundException();

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, user: User) {
    const { images, ...toUpdate } = updateServiceDto;
    const service = await this.serviceRepository.preload({
      id,
      ...toUpdate,
      user,
    });
    if (!service) throw new NotFoundException(`Image not found`);

    // Create queryRunner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (images) {
        await queryRunner.manager.delete(ServiceImage, { service: { id: id } });
        service.images = images.map((img) =>
          this.serviceImageRepository.create({ url: img }),
        );
      }

      await queryRunner.manager.save(service);
      await queryRunner.commitTransaction();
      await queryRunner.release();
      // await this.serviceRepository.save(service);
      return this.findOne(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const service = await this.findOne(id);
    await this.serviceRepository.remove(service);
    return service;
  }

  // Handle Errors
  private handleDBExceptions(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs.',
    );
  }
}
