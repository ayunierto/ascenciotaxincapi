import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import * as bcrypt from 'bcrypt';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      this.logger.error(error);
      throw new BadRequestException('Error creating user');
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.userRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...userData } = updateUserDto;
    const pass = bcrypt.hashSync(password, 10);
    const user = await this.userRepository.preload({
      id,
      password: pass,
      ...userData,
    });
    if (!user) throw new NotFoundException();
    try {
      await this.userRepository.save(user);
      return user;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error updating user');
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const { password, ...userData } = updateProfileDto;

    let userUpdate: User;

    try {
      if (password) {
        const pass = bcrypt.hashSync(password, 10);

        userUpdate = await this.userRepository.preload({
          id: user.id,
          password: pass,
          ...userData,
        });

        await this.userRepository.save(userUpdate);
        return userUpdate;
      }

      userUpdate = await this.userRepository.preload({
        id: user.id,
        ...userData,
      });

      await this.userRepository.save(userUpdate);
      return userUpdate;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error updating user');
    }
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    try {
      await this.userRepository.remove(user);
      return user;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error deleting user');
    }
  }

  async removeAll() {
    const query = this.userRepository.createQueryBuilder('user');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Can not delete users',
          error: error,
          cause: 'Unknown',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
