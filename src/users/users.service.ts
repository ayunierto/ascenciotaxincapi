import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { User } from 'src/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOneBy({
      email: userData.email,
    });
    if (user)
      throw new ConflictException('Email already in use.', {
        cause: 'email_already_in_use',
        description: `The email ${userData.email} is already registered.`,
      });

    const hashedPassword = await this.hashPassword(userData.password);

    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return await this.usersRepository.save(newUser);
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    const users = await this.usersRepository.find({
      take: limit,
      skip: offset,
      order: { firstName: 'ASC' },
    });

    const total = await this.usersRepository.count();

    return {
      count: total,
      pages: Math.ceil(total / limit),
      users: users,
    };
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException(`User not found.`);
    }
    return user;
  }

  /**
   * Finds a user by their password reset token.
   * This method is needed for the reset-password flow.
   * @param code The reset token to search for.
   * @returns The user entity or undefined if not found.
   * @throws InternalServerErrorException on database errors.
   */
  async findByPasswordResetToken(code: string): Promise<User | undefined> {
    try {
      const user = await this.usersRepository.findOne({
        where: { passwordResetCode: code },
      });
      // Or using findOneBy:
      // const user = await this.usersRepository.findOneBy({ passwordResetToken: token });

      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'Failed to find user by reset token.',
      );
    }
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.findById(id);

      const updatedUser = this.usersRepository.merge(user, updateData);

      const result = await this.usersRepository.save(updatedUser);

      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException('Failed to update user.');
    }
  }

  /**
   * Deletes a user record from the database.
   * @param id The ID of the user to delete.
   * @returns A Promise indicating completion (e.g., DeleteResult or void).
   * @throws InternalServerErrorException on database errors.
   */
  async remove(id: string) {
    const user = await this.findById(id);

    try {
      await this.usersRepository.remove(user);
      return user;
    } catch (error) {
      console.error(`Database error deleting user ${id}:`, error);
      throw new InternalServerErrorException(
        `Failed to delete user ${id} from the database.`,
      );
    }
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
  }

  async removeAll() {
    const query = this.usersRepository.createQueryBuilder('user');

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
