import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Repository } from 'typeorm';
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
      return { ...service, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.serviceRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const service = await this.serviceRepository.findOneBy({ id });
    if (!service) throw new NotFoundException();

    return service;
  }

  async update(id: string, updateServiceDto: UpdateServiceDto, user: User) {
    try {
      const service = await this.serviceRepository.preload({
        id,
        ...updateServiceDto,
        user,
        images: [],
      });
      if (!service) throw new NotFoundException();
      await this.serviceRepository.save(service);
      return service;
    } catch (error) {
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
