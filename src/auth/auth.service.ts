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
    const {
      password,
      countryCode,
      phoneNumber: number,
      ...userData
    } = signupUserDto;

    // Generate a random 6 digit number
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();

    try {
      const user = this.userRepository.create({
        phoneNumber: `${countryCode}${number}`,
        ...userData,
        password: bcrypt.hashSync(password, 10),
        verificationCode,
      });
      const savedUser = await this.userRepository.save(user);

      // if (savedUser) {
      //   await this.sendWhatsAppVerificationCodeWithTwillio(
      //     signupUserDto.phoneNumber,
      //     verificationCode,
      //   );
      // }

      return {
        ...savedUser,
        token: this.getJwtToken({ id: savedUser.id }),
      };
    } catch (error) {
      console.warn(error.detail);
      if (error.code === '23505') {
        const err: string = error.detail;
        const regex: RegExp = /\(([^)]+)\)/;
        const match = err.match(regex);
        const word = match ? match[1] : null;

        throw new HttpException(
          {
            code: HttpStatus.CONFLICT,
            message: `${word} already exists`,
            error: 'Conflict',
            cause: word,
          },
          HttpStatus.CONFLICT,
        );
      }
      console.warn(error);
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
      where: [{ email: username }, { phoneNumber: username }],
      select: {
        email: true,
        password: true,
        id: true,
        roles: true,
        isActive: true,
        name: true,
        appointments: true,
        birthdate: true,
        lastLogin: true,
        lastName: true,
        phoneNumber: true,
        registrationDate: true,
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

    if (!user.isActive) {
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

  // async sendWhatsAppVerificationCodeWithTwillio(
  //   phoneNumber: string,
  //   verificationCode: string,
  // ) {
  //   const accountSid = process.env.TWILLIO_ACCOUNTSID;
  //   const authToken = process.env.TWILLIO_AUTHTOKEN;
  //   const client = require('twilio')(accountSid, authToken);

  //   client.messages
  //     .create({
  //       from: 'whatsapp:+14155238886',
  //       contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
  //       contentVariables: `{"1":"${verificationCode}"}`,
  //       to: `whatsapp:${phoneNumber}`,
  //     })
  //     .then((message) => console.log(message));

  //   // Sin plantillas
  //   // const client = require('twilio')(accountSid, authToken);

  //   // client.messages
  //   //   .create({
  //   //     body: 'Your appointment is coming up on July 21 at 3PM',
  //   //     from: 'whatsapp:+14155238886',
  //   //     to: 'whatsapp:+51917732227',
  //   //   })
  //   //   .then((message) => console.log(message.sid))
  //   //   .done();

  //   return verificationCode;
  // }

  // async sendSMSVerificationCodeWithTwillio(
  //   phoneNumber: string,
  //   verificationCode: string,
  // ) {
  //   const TWILLIO_ACCOUNTSID = process.env.TWILLIO_ACCOUNTSID;
  //   const TWILLIO_AUTHTOKEN = process.env.TWILLIO_AUTHTOKEN;
  //   const client = require('twilio')(TWILLIO_ACCOUNTSID, TWILLIO_AUTHTOKEN);
  //   client.messages
  //     .create({
  //       body: `Your Ascenciotax verification code is: ${verificationCode}`,
  //       from: '+12542800440',
  //       to: phoneNumber,
  //     })
  //     .then((message) => console.log(message.body));

  //   return verificationCode;
  // }

  async verifyCode(verifyUserDto: VerifyUserDto) {
    const { phoneNumber, verficationCode } = verifyUserDto;
    const user = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.verificationCode !== verficationCode) {
      throw new UnauthorizedException('Invalid verification code');
    }

    user.isActive = true;
    user.verificationCode = null;
    await this.userRepository.save(user);

    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }
}
