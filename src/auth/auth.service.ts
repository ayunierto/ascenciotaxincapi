import {
  BadRequestException,
  ConflictException,
  forwardRef,
  Inject,
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
import { AccountService } from 'src/accounting/accounts/accounts.service';
import { CurrencyService } from 'src/accounting/currencies/currencies.service';
import { AccountsTypesService } from 'src/accounting/accounts-types/accounts-types.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    @Inject(forwardRef(() => AccountService))
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => AccountsTypesService))
    private readonly accountTypeService: AccountsTypesService,
    @Inject(forwardRef(() => CurrencyService))
    private readonly currencyService: CurrencyService,
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
        phoneNumber: number ? `${countryCode}${number}` : null,
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

      // Create account for user
      const currency = await this.currencyService.findAll();
      const accountTypeCashDefault = await this.accountTypeService.create(
        {
          name: 'Cash',
          description: 'Cash account',
        },
        user,
      );
      await this.accountService.create(
        {
          accountTypeId: accountTypeCashDefault.id,
          currencyId: currency[0].id,
          name: 'Cash',
          description: 'Cash account',
          icon: 'cash',
        },
        user,
      );

      delete savedUser.password;
      delete savedUser.verificationCode;

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
    const userCredentials = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
      select: {
        password: true,
        isActive: true,
        verificationCode: true,
      },
    });
    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
    });

    if (!userCredentials)
      throw new UnauthorizedException('User or password incorrect');

    if (!userCredentials.isActive && userCredentials.verificationCode) {
      throw new UnauthorizedException('User is not verified');
    }

    // If the user is inactive for any cause that has not been to complete their registration
    if (!userCredentials.isActive)
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'The user is inactive, please contact support.',
        statusCode: 401,
        cause: 'inactive',
      });

    if (!bcrypt.compareSync(password, userCredentials.password))
      throw new UnauthorizedException('User or password incorrect');

    return {
      user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async deleteAccount(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    await this.userRepository.remove(user);
    return user;
  }

  async verifyCode(verifyUserDto: VerifyUserDto) {
    const { username, verificationCode } = verifyUserDto;

    const userFound = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
      select: {
        verificationCode: true,
        isActive: true,
      },
    });

    if (!userFound) throw new BadRequestException('User not found');

    if (userFound.verificationCode !== verificationCode)
      throw new UnauthorizedException('Invalid verification code');

    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
    });
    await this.userRepository.save({
      ...user,
      isActive: true,
      verificationCode: null,
    });

    return {
      user,
      token: this.getJwtToken({ id: userFound.id }),
    };
  }

  async sendVerificationCode(sendCodeDto: SendCodeDto) {
    try {
      const { username, verificationPlatform } = sendCodeDto;
      const user = await this.userRepository.findOne({
        where: [{ email: username }, { phoneNumber: username }],
        select: {
          email: true,
          name: true,
          verificationCode: true,
        },
      });

      if (!user) throw new BadRequestException('User not found');

      if (verificationPlatform === 'email') {
        this.mailService.sendMailVerificationCode({
          to: user.email,
          clientName: user.name,
          verificationCode: user.verificationCode,
        });
      }
      // else if (verificationPlatform === 'whatsapp') {
      //   this.sendWhatsAppVerificationCodeWithTwillio(
      //     user.phoneNumber,
      //     user.verificationCode,
      //   );
      // } else {
      //   this.sendSMSVerificationCodeWithTwillio(
      //     user.phoneNumber,
      //     user.verificationCode,
      //   );
      // }

      return {
        message: 'Verification code sent successfully',
        error: null,
        statusCode: HttpStatus.OK,
      };
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Error sending verification code');
    }
  }

  checkStatus(user: User) {
    return {
      user,
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

  generateVerificationCode() {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    return code;
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { username, verificationPlatform } = resetPasswordDto;
    const userFound = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
      select: {
        password: true,
        isActive: true,
        verificationCode: true,
      },
    });

    if (!userFound) throw new BadRequestException('User not found');

    const code = this.generateVerificationCode();

    const user = await this.userRepository.findOne({
      where: [{ email: username }, { phoneNumber: username }],
    });

    await this.userRepository.save({
      ...user,
      verificationCode: code,
    });

    this.sendVerificationCode({
      username: user.email,
      verificationPlatform: verificationPlatform,
    });

    return { ...user };
  }

  async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
    const userDB = await this.userRepository.findOneBy({ id: user.id });

    if (!userDB) throw new NotFoundException('User not found');

    const newPassword = bcrypt.hashSync(changePasswordDto.password, 10);
    await this.userRepository.save({
      ...userDB,
      password: newPassword,
    });
    return { user: userDB, token: this.getJwtToken({ id: user.id }) };
  }
}
