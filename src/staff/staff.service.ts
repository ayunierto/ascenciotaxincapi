import {
  BadRequestException,
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

@Injectable()
export class StaffService {
  private readonly logger = new Logger('StaffService');

  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    const { services, ...rest } = createStaffDto;

    const dbServices = await this.serviceRepository.findBy({
      id: In(services),
    });

    try {
      const staff = this.staffRepository.create({
        services: dbServices,
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
      },
    });
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findOneBy({ id });
    if (!staff) throw new NotFoundException();

    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const { services, ...rest } = updateStaffDto;

    const dbServices = await this.serviceRepository.findBy({
      id: In(services),
    });

    const staff = await this.staffRepository.preload({
      id,
      services: dbServices,
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
}
