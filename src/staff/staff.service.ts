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
import { Repository } from 'typeorm';

@Injectable()
export class StaffService {
  private readonly logger = new Logger('StaffService');

  constructor(
    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async create(createStaffDto: CreateStaffDto) {
    try {
      const staff = this.staffRepository.create(createStaffDto);
      await this.staffRepository.save(staff);
      return staff;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll() {
    return await this.staffRepository.find();
  }

  async findOne(id: string) {
    const staff = await this.staffRepository.findOneBy({ id });
    if (!staff) throw new NotFoundException();

    return staff;
  }

  async update(id: string, updateStaffDto: UpdateStaffDto) {
    const staff = await this.staffRepository.preload({
      id,
      ...updateStaffDto,
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
