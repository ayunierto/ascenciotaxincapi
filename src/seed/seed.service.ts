import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServicesService } from 'src/services/services.service';
import { initialData } from './data/seed-data';
import { UsersService } from '../users/users.service';
import { ScheduleService } from 'src/schedule/schedule.service';
import { StaffService } from 'src/staff/staff.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Staff } from 'src/staff/entities/staff.entity';

@Injectable()
export class SeedService {
  constructor(
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
    private readonly scheduleService: ScheduleService,
    private readonly staffService: StaffService,

    @InjectRepository(Staff)
    private readonly staffRepository: Repository<Staff>,
  ) {}

  async runSeed() {
    await this.deleteData();

    const users = initialData.users;
    const insertUserPromises = [];
    users.forEach((user) => {
      insertUserPromises.push(this.usersService.create(user));
    });
    const createdUsers = await Promise.all(insertUserPromises);

    const services = initialData.services;
    const insertServicesPromises = [];
    services.forEach((service) => {
      insertServicesPromises.push(
        this.servicesService.create(service, createdUsers[0]),
      );
    });
    const createdServices = await Promise.all(insertUserPromises);

    const staff = initialData.staff;
    const insertStaffPromises = [];
    staff.forEach((staff) => {
      insertStaffPromises.push(this.staffService.create(staff));
    });
    const createdStaff = await Promise.all(insertStaffPromises);

    throw new HttpException(
      {
        code: HttpStatus.CREATED,
        message: 'Seed Executed',
      },
      HttpStatus.CREATED,
    );
  }

  private async deleteData() {
    await this.servicesService.removeAll();
    await this.usersService.removeAll();

    this.staffRepository
      .createQueryBuilder('staff')
      .delete()
      .where({})
      .execute();
  }
}
