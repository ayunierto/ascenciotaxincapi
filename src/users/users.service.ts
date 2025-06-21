import {
  BadRequestException,
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
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from 'src/auth/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ExceptionResponse } from 'src/common/interfaces';

@Injectable()
export class UsersService {
  private readonly logger = new Logger('UsersService');

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * Creates a new user record in the database.
   * @param userData The data for the new user.
   * @returns The created user entity.
   * @throws InternalServerErrorException on database errors.
   */
  async create(userData: Partial<User>): Promise<User | ExceptionResponse> {
    // Check if user already exists
    const existingUser = await this.findByEmail(userData.email);
    if (existingUser)
      return {
        cause: 'email_already_exists',
        message: 'Email already exists, please login.',
        error: 'Conflict',
        statusCode: HttpStatus.CONFLICT,
      };

    // Hash the password
    const passwordHash = await this.hashPassword(userData.password);

    const newUser = this.usersRepository.create({
      ...userData,
      password: passwordHash,
    });

    const user = await this.usersRepository.save(newUser);
    return user;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;
    return await this.usersRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id });

    return user;
  }

  // For auth login
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ email });
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
      console.error(`Database error finding user by reset token:`, error);
      throw new InternalServerErrorException(
        'Failed to find user by reset token.',
      );
    }
  }

  /**
   * Updates a user record in the database.
   * Can be used for full or partial updates.
   * @param id The ID of the user to update.
   * @param updateData The data to update the user with (can be a partial object).
   * @returns The updated user entity.
   * @throws NotFoundException if the user ID does not exist.
   * @throws InternalServerErrorException on database errors.
   */
  async update(id: string, updateData: Partial<User>): Promise<User> {
    try {
      const user = await this.usersRepository.findOneBy({ id });

      if (!user)
        throw new NotFoundException(`User with ID ${id} not found for update.`);

      const updatedUser = Object.assign(user, updateData);

      const result = await this.usersRepository.save(updatedUser);

      return result;
    } catch (error) {
      console.error(`Database error updating user ${id}:`, error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        `Failed to update user ${id} in the database.`,
      );
    }
  }

  async updateProfile(updateProfileDto: UpdateProfileDto, user: User) {
    const { password, ...userData } = updateProfileDto;

    let userUpdate: User;

    try {
      if (password) {
        const newPassword = bcrypt.hashSync(password, 10);

        userUpdate = await this.usersRepository.preload({
          id: user.id,
          password: newPassword,
          ...userData,
        });

        await this.usersRepository.save(userUpdate);
        return userUpdate;
      }

      userUpdate = await this.usersRepository.preload({
        id: user.id,
        ...userData,
      });

      await this.usersRepository.save(userUpdate);
      return userUpdate;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error updating user');
    }
  }

  /**
   * Deletes a user record from the database.
   * @param id The ID of the user to delete.
   * @returns A Promise indicating completion (e.g., DeleteResult or void).
   * @throws InternalServerErrorException on database errors.
   */
  async remove(id: string) {
    const user = await this.findOne(id);

    if (!user)
      throw new NotFoundException(`User with ID ${id} not found for delete.`);

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
