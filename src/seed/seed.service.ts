import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ServicesService } from 'src/services/services.service';
import { User } from 'src/auth/entities/user.entity';
import { initialData } from './data/seed-data';
import { UsersService } from '../users/users.service';

@Injectable()
export class SeedService {
  constructor(
    private readonly usersService: UsersService,
    private readonly servicesService: ServicesService,
  ) {}

  async runSeed() {
    await this.deleteData();

    const createdUsers = await this.seedUsers();
    const createdServices = await this.seedServices(createdUsers[0]);

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
  }

  private async seedUsers() {
    const users = initialData.users;

    const insertPromises = [];

    users.forEach((user) => {
      insertPromises.push(this.usersService.create(user));
    });

    const result = await Promise.all(insertPromises);

    return result;
  }

  private async seedServices(user: User) {
    const services = initialData.services;

    const insertPromises = [];

    services.forEach((service) => {
      insertPromises.push(this.servicesService.create(service, user));
    });

    const result = await Promise.all(insertPromises);

    return result;
  }

  // private async insertNewUsers() {
  //   const seedUsers = initialData.users;

  //   seedUsers.forEach(async (user) => {
  //     await this.usersService.create(user);
  //   });
  // }

  // private async insertNewStaff() {
  //   const seedStaff = initialData.staff;

  //   const staffMembers: Staff[] = [];

  //   seedStaff.forEach((member) => {
  //     staffMembers.push(this.staffRepository.create(member));
  //   });

  //   const dbStaff = await this.staffRepository.save(seedStaff);

  //   return dbStaff;
  // }
}
