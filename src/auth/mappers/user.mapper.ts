import { User } from '../entities/user.entity';
import { BasicUser } from '../interfaces/basic-user.interface';

export class UserMapper {
  static toBasicUser(user: User): BasicUser {
    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      countryCode: user.countryCode,
      phoneNumber: user.phoneNumber,
      locale: user.locale,
      roles: user.roles,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}
