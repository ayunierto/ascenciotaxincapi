import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Log } from './entities/log.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CreateLogResponse, GetLogsResponse } from './interfaces';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async create(
    createLogDto: CreateLogDto,
    user: User,
  ): Promise<CreateLogResponse> {
    try {
      const newLog = this.logRepository.create({
        ...createLogDto,
        user,
      });
      await this.logRepository.save(newLog);
      return newLog;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the log. Please try again later.',
        'LOG_CREATE_FAILED',
      );
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    user: User,
  ): Promise<GetLogsResponse> {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const logs = await this.logRepository.find({
        take: limit,
        skip: offset,
        where: { user: { id: user.id } },
        order: {
          createdAt: 'DESC',
        },
      });
      return logs;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching logs. Please try again later.',
        'LOG_FIND_FAILED',
      );
    }
  }
}
