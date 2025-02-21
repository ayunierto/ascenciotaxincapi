import { Injectable } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async create(createLogDto: CreateLogDto, user: User) {
    try {
      const newLog = this.logRepository.create({
        ...createLogDto,
        user,
      });
      await this.logRepository.save(newLog);
      return newLog;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const logs = await this.logRepository.find({
        take: limit,
        skip: offset,
        where: { user: { id: user.id } },
        order: {
          date: 'DESC',
        },
      });
      return logs;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }
}
