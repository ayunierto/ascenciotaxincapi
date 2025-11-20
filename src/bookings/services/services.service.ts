import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { DataSource, In, Repository, IsNull } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Service } from './entities';
import { StaffMember } from 'src/bookings/staff-members/entities/staff-member.entity';
import {
  CreateServiceResponse,
  DeleteServiceResponse,
  GetServiceResponse,
  GetServicesResponse,
  UpdateServiceResponse,
} from './interfaces';

@Injectable()
export class ServicesService {
  private readonly logger = new Logger(ServicesService.name);

  constructor(
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(StaffMember)
    private readonly staffRepository: Repository<StaffMember>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    createServiceDto: CreateServiceDto,
  ): Promise<CreateServiceResponse> {
    const { staffIds, ...serviceData } = createServiceDto;

    try {
      this.logger.log(`Creating service: ${serviceData.name}`);

      // Validate and get staff members if provided
      const staff = await this.validateAndGetStaff(staffIds);

      const service = this.serviceRepository.create({
        ...serviceData,
        staffMembers: staff,
      });

      const savedService = await this.serviceRepository.save(service);
      this.logger.log(
        `Service created successfully with ID: ${savedService.id}`,
      );

      return savedService;
    } catch (error) {
      this.logger.error(
        `Error creating service: ${error.message}`,
        error.stack,
      );

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating service. Please try again later.',
      );
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<GetServicesResponse> {
    const { limit = 10, offset = 0 } = paginationDto;

    try {
      this.logger.log(
        `Fetching services with pagination - limit: ${limit}, offset: ${offset}`,
      );

      const [services, total] = await this.serviceRepository.findAndCount({
        take: limit,
        skip: offset,
        where: { deletedAt: IsNull() }, // Only get non-deleted services
        relations: {
          staffMembers: true,
        },
        order: { createdAt: 'DESC' },
      });

      const result = {
        count: total,
        pages: Math.ceil(total / limit),
        services,
      };

      this.logger.log(`Found ${total} services`);
      return result;
    } catch (error) {
      this.logger.error(
        `Error fetching services: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'An unexpected error occurred while finding services. Please try again later.',
      );
    }
  }

  async findOne(id: string): Promise<GetServiceResponse> {
    this.logger.log(`Fetching service with ID: ${id}`);

    const service = await this.serviceRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: {
        staffMembers: true,
      },
    });

    if (!service) {
      this.logger.warn(`Service not found with ID: ${id}`);
      throw new NotFoundException('Service not found.');
    }

    return service;
  }

  async update(
    id: string,
    updateServiceDto: UpdateServiceDto,
  ): Promise<UpdateServiceResponse> {
    const { staffIds, ...serviceData } = updateServiceDto;

    try {
      this.logger.log(`Updating service with ID: ${id}`);

      // Check if service exists first
      await this.findOne(id);

      // Validate and get staff members if provided
      const staff = await this.validateAndGetStaff(staffIds);

      const service = await this.serviceRepository.preload({
        id,
        ...serviceData,
        staffMembers: staff,
      });

      if (!service) {
        throw new NotFoundException('Service not found.');
      }

      const updatedService = await this.serviceRepository.save(service);
      this.logger.log(`Service updated successfully with ID: ${id}`);

      return updatedService;
    } catch (error) {
      this.logger.error(
        `Error updating service with ID ${id}: ${error.message}`,
        error.stack,
      );

      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while updating service. Please try again later.',
      );
    }
  }

  async remove(id: string): Promise<DeleteServiceResponse> {
    try {
      this.logger.log(`Soft deleting service with ID: ${id}`);

      const service = await this.findOne(id);
      service.deletedAt = new Date();

      const deletedService = await this.serviceRepository.save(service);
      this.logger.log(`Service soft deleted successfully with ID: ${id}`);

      return deletedService;
    } catch (error) {
      this.logger.error(
        `Error deleting service with ID ${id}: ${error.message}`,
        error.stack,
      );

      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting service. Please try again later.',
      );
    }
  }

  /**
   * Private helper method to validate and retrieve staff members
   */
  private async validateAndGetStaff(
    staffIds?: string[],
  ): Promise<StaffMember[]> {
    if (!staffIds || staffIds.length === 0) {
      return [];
    }

    this.logger.log(`Validating ${staffIds.length} staff member(s)`);

    const staff = await this.staffRepository.findBy({
      id: In(staffIds),
    });

    // Check if all requested staff members were found
    const foundStaffIds = staff.map((s) => s.id);
    const missingStaffIds = staffIds.filter(
      (id) => !foundStaffIds.includes(id),
    );

    if (missingStaffIds.length > 0) {
      throw new BadRequestException(
        `StaffMember member(s) not found with ID(s): ${missingStaffIds.join(', ')}`,
      );
    }

    this.logger.log(`Successfully validated ${staff.length} staff member(s)`);
    return staff;
  }
}
