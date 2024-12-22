import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { VerifyUserDto } from './dto/verify-user.dto';
import { SignupUserDto } from './dto/signup-user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupUserDto: SignupUserDto) {
    const { password, ...userData } = signupUserDto;
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    console.warn(password);
    try {
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
        verification_code: verificationCode,
      });
      const savedUser = await this.userRepository.save(user);

      if (savedUser) {
        await this.sendSMSVerificationCodeWithTwillio(
          signupUserDto.phone_number,
          verificationCode,
        );
      }

      return savedUser;
    } catch (error) {
      if (error.code === '23505') {
        const err: string = error.detail;
        const regex: RegExp = /\(([^)]+)\)/;
        const match = err.match(regex);
        const word = match ? match[1] : null;

        throw new HttpException(
          {
            code: HttpStatus.CONFLICT,
            message: 'Resource already exists',
            error: 'Conflict',
            cause: word,
          },
          HttpStatus.CONFLICT,
        );
      }
      throw new HttpException(
        {
          code: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Please check the server log for more information',
          error: 'Internal server error',
          cause: 'Unknown',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // TODO: Probar si quitando el select  evia todos los campos menos el password que esta quitado en la entidad
  async signin(loginUserDto: LoginUserDto) {
    const { password, username } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phone_number: username }],
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

    if (!user) {
      throw new HttpException(
        {
          code: HttpStatus.UNAUTHORIZED,
          message: 'User or password incorrect',
          error: 'Unauthorized',
          cause: 'email',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!user.is_active) {
      throw new HttpException(
        {
          code: HttpStatus.UNAUTHORIZED,
          message:
            'The user is inactive, please check your account or contact the administration',
          error: 'Inactive',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!bcrypt.compareSync(password, user.password)) {
      throw new HttpException(
        {
          code: HttpStatus.UNAUTHORIZED,
          message: 'User or password incorrect',
          error: 'Unauthorized',
          cause: 'password',
        },
        HttpStatus.UNAUTHORIZED,
      );
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

  async sendSMSVerificationCodeWithTwillio(
    phoneNumber: string,
    verificationCode: string,
  ) {
    const TWILLIO_ACCOUNTSID = process.env.TWILLIO_ACCOUNTSID;
    const TWILLIO_AUTHTOKEN = process.env.TWILLIO_AUTHTOKEN;
    const client = require('twilio')(TWILLIO_ACCOUNTSID, TWILLIO_AUTHTOKEN);
    client.messages
      .create({
        body: `Your Ascenciotax verification code is: ${verificationCode}`,
        from: '+12542800440',
        to: phoneNumber,
      })
      .then((message) => console.log(message.sid));

    return verificationCode;
  }

  async verifyCode(verifyUserDto: VerifyUserDto) {
    const { phone_number, verfication_code } = verifyUserDto;
    const user = await this.userRepository.findOne({
      where: { phone_number: phone_number },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verification_code !== verfication_code) {
      throw new UnauthorizedException('Invalid verification code');
    }

    user.is_active = true;
    user.verification_code = null;
    await this.userRepository.save(user);

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }
}
