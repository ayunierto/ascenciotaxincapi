import { Injectable } from '@nestjs/common';
import { ServicesService } from 'src/services/services.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly servicesService: ServicesService,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async runSeed() {
    await this.delteTables();

    const firstUser = await this.insertNewUsers();

    await this.insertNewServices(firstUser);

    return 'Seed Executed';
  }

  private async delteTables() {
    await this.servicesService.deleteAllServices();

    const queryBuilder = this.userRepository.createQueryBuilder();
    await queryBuilder.delete().where({}).execute();
  }

  private async insertNewUsers() {
    const seedUsers = initialData.users;

    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepository.create(user));
    });

    const dbUsers = await this.userRepository.save(seedUsers);

    return dbUsers[0];
  }

  private async insertNewServices(user: User) {
    await this.servicesService.deleteAllServices();

    const services = initialData.services;

    const insertPromises = [];

    services.forEach((service) => {
      insertPromises.push(this.servicesService.create(service, user));
    });

    await Promise.all(insertPromises);

    return true;
  }
}
