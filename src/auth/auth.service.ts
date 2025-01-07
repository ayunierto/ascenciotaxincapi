import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './entities/user.entity';
import { LoginUserDto, SignupUserDto } from './dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { VerifyUserDto } from './dto/verify-user.dto';
import { MailService } from 'src/mail/mail.service';
import { SendCodeDto } from './dto/send-code.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {}

  async signup(signupUserDto: SignupUserDto) {
    const {
      password,
      countryCode,
      phoneNumber: number,
      verificationPlatform,
      ...userData
    } = signupUserDto;

    // Generate a random 6 digit number
    const verificationCode = this.generateVerificationCode();

    try {
      const user = this.userRepository.create({
        phoneNumber: `${countryCode}${number}`,
        password: bcrypt.hashSync(password, 10),
        verificationCode,
        ...userData,
      });
      const savedUser = await this.userRepository.save(user);

      if (savedUser) {
        this.sendVerificationCode({
          username: user.email,
          verificationPlatform,
        });
      }

      return {
        ...savedUser,
      };
    } catch (error) {
      console.error(error.detail);
      if (error.code === '23505') {
        const err: string = error.detail;
        const regex: RegExp = /\(([^)]+)\)/;
        const match = err.match(regex);
        const word = match ? match[1] : null;
        throw new ConflictException(`${word} already exists`);
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Please check the server log for more information',
      );
    }
  }

  async signin(loginUserDto: LoginUserDto) {
    const { password, username } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
    });

    if (!user) throw new UnauthorizedException('User or password incorrect');

    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('User or password incorrect');

    if (!user.isActive && user.verificationCode) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'The user is inactive, please verify your account.',
        statusCode: 401,
        cause: 'verify',
      });
    }
    if (!user.isActive)
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'The user is inactive, please contact support.',
        statusCode: 401,
        cause: 'inactive',
      });

    delete user.password;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async verifyCode(verifyUserDto: VerifyUserDto) {
    const { username, verificationCode } = verifyUserDto;

    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
    });

    if (!user) throw new BadRequestException('User not found');

    if (user.verificationCode !== verificationCode)
      throw new UnauthorizedException('Invalid verification code');

    user.isActive = true;
    user.verificationCode = null;
    await this.userRepository.save(user);

    delete user.password;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async sendVerificationCode(sendCodeDto: SendCodeDto) {
    const { username, verificationPlatform } = sendCodeDto;
    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
    });

    if (!user) throw new BadRequestException('User not found');

    if (verificationPlatform === 'email') {
      this.mailService.sendMailVerificationCode({
        to: user.email,
        clientName: user.name,
        verificationCode: user.verificationCode,
      });
    } else if (verificationPlatform === 'whatsapp') {
      this.sendWhatsAppVerificationCodeWithTwillio(
        user.phoneNumber,
        user.verificationCode,
      );
    } else {
      this.sendSMSVerificationCodeWithTwillio(
        user.phoneNumber,
        user.verificationCode,
      );
    }
    return {
      message: 'Verification code sent',
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

  async sendWhatsAppVerificationCodeWithTwillio(
    phoneNumber: string,
    verificationCode: string,
  ) {
    const accountSid = process.env.TWILLIO_ACCOUNTSID;
    const authToken = process.env.TWILLIO_AUTHTOKEN;
    const client = require('twilio')(accountSid, authToken);

    client.messages
      .create({
        from: 'whatsapp:+14155238886',
        contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
        contentVariables: `{"1":"${verificationCode}"}`,
        to: `whatsapp:${phoneNumber}`,
      })
      .then((message) => console.log(message));

    return verificationCode;
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
      .then((message) => console.log(message.body));

    return verificationCode;
  }

  generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async resetPassword(username: string) {
    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
    });

    if (!user) throw new BadRequestException('User not found');

    const code = this.generateVerificationCode();
    user.verificationCode = code;
    const savedUser = await this.userRepository.save(user);

    delete savedUser.password;
    delete savedUser.verificationCode;

    this.sendVerificationCode({
      username: user.email,
      verificationPlatform: 'email',
    });

    return { ...savedUser };
  }

  async changePassword(user: User, password: string) {
    const tmpUser = await this.userRepository.findOneBy({ id: user.id });
    if (!user) throw new NotFoundException('User not found');

    tmpUser.password = bcrypt.hashSync(password, 10);
    const savedUser = await this.userRepository.save(tmpUser);
    delete savedUser.password;
    return { ...savedUser, token: this.getJwtToken({ id: user.id }) };
  }
}
