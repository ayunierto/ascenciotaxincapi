import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { UpdateStaffMemberDto } from './dto/update-staff-member.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { StaffMember } from './entities/staff-member.entity';
import { In, Repository } from 'typeorm';
import { Schedule } from 'src/bookings/schedules/entities/schedule.entity';
import { Service } from '../services/entities';

@Injectable()
export class StaffMembersService {
  private readonly logger = new Logger(StaffMembersService.name);

  constructor(
    @InjectRepository(StaffMember)
    private readonly staffRepository: Repository<StaffMember>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Schedule)
    private readonly scheduleRepository: Repository<Schedule>,
  ) {}

  async create(createStaffDto: CreateStaffMemberDto) {
    const {
      services: servicesIds,
      schedules: schedulesIds,
      ...rest
    } = createStaffDto;

    try {
      const services = [];
      if (servicesIds && servicesIds.length > 0) {
        services.push(
          ...(await this.serviceRepository.findBy({
            id: In(servicesIds),
          })),
        );
      }
      const schedules = [];
      if (schedulesIds && schedulesIds.length > 0) {
        schedules.push(
          ...(await this.scheduleRepository.findBy({
            id: In(schedulesIds),
          })),
        );
      }

      const staff = this.staffRepository.create({
        services,
        schedules,
        ...rest,
      });

      return await this.staffRepository.save(staff);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message ||
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
      const staff = await this.staffRepository.findOne({
        where: { id },
        relations: {
          services: true,
          schedules: true,
        },
      });
      if (!staff) throw new NotFoundException('StaffMember not found.');

      return staff;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while finding staff. Please try again later.',
      );
    }
  }

  async update(id: string, updateStaffDto: UpdateStaffMemberDto) {
    const {
      services: servicesIds,
      schedules: schedulesIds,
      ...rest
    } = updateStaffDto;

    try {
      const services = [];
      if (servicesIds && servicesIds.length > 0) {
        services.push(
          ...(await this.serviceRepository.findBy({
            id: In(servicesIds),
          })),
        );
      }
      const schedules = [];
      if (schedulesIds && schedulesIds.length > 0) {
        schedules.push(
          ...(await this.scheduleRepository.findBy({
            id: In(schedulesIds),
          })),
        );
      }

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
      await this.staffRepository.remove(staff);
      return staff;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting staff. Please try again later.',
      );
    }
  }
}
