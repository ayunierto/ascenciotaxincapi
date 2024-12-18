import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { CreateUserDto, LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    const { password, ...userData } = createUserDto;
    // Send SMS
    const accountSid = '';
    const authToken = '';
    const client = require('twilio')(accountSid, authToken);

    client.verify.v2
      .services('')
      .verificationChecks.create({ to: '+51917732227', code: '033588' })
      .then((verification_check) => console.log(verification_check.status));

    try {
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return { ...user, token: this.getJwtToken({ id: user.id }) };
    } catch (error) {
      this.handleDBError(error);
    }
  }

  // TODO: Probar si quitando el select  evia todos los campos menos el password que esta quitado en la entidad
  async signin(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: {
        email: true,
        password: true,
        id: true,
        roles: true,
        is_active: true,
        name: true,
        appointments: true,
        birthdate: true,
        last_login: true,
        last_name: true,
        phone_number: true,
        registration_date: true,
      },
    });

    console.log(user);

    if (!user) {
      throw new UnauthorizedException(`${email} does not exist, please signup`);
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new UnauthorizedException('The provided password is not valid');
    }

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  checkStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleDBError(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    console.error(error);
    throw new InternalServerErrorException('Please see server logs');
  }
}
