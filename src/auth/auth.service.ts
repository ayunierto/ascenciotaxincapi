import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { DateTime } from 'luxon';

import {
  ChangePasswordResponse,
  CheckStatusResponse,
  DeleteAccountResponse,
  ForgotPasswordResponse,
  SignInResponse,
  SignUpResponse,
  ResendEmailVerificationResponse,
  ResendResetPasswordCodeResponse,
  ResetPasswordResponse,
  VerifyEmailCodeResponse,
  UpdateProfileResponse,
} from './interfaces/auth-responses.interface';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { NotificationService } from 'src/notification/notification.service';
import { UserMapper } from './mappers/user.mapper';
import {
  ForgotPasswordDto,
  ResendEmailVerificationCodeDto,
  VerifyEmailCodeDto,
  ResendResetPasswordCodeDto,
  ChangePasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  UpdateProfileDto,
  DeleteAccountDto,
} from './dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  // Email verification code TTL in minutes
  private emailVerificationCodeTTL: number;

  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {
    this.emailVerificationCodeTTL = process.env.EMAIL_VERIFICATION_CODE_TTL
      ? Number(process.env.EMAIL_VERIFICATION_CODE_TTL)
      : 15;
  }

  async signUp(signUpDto: SignUpDto): Promise<SignUpResponse> {
    this.logger.log(`Sign up attempt of: ${signUpDto.email}`);

    // Check if user already exists
    const existingUser = await this.usersRepository.findOneBy({
      email: signUpDto.email,
    });
    if (existingUser) {
      this.logger.warn(`Sign up failed - email already exists`);
      throw new ConflictException('Email already exists, please login.');
    }

    // Hash the password
    const passwordHash = await this.hashPassword(signUpDto.password);

    // Generate verification code and expiration for email verification
    const verificationCode = this.generateNumericCode(6);
    const verificationCodeExpiresAt = DateTime.utc()
      .plus({ minutes: this.emailVerificationCodeTTL })
      .toJSDate();

    // Create new user
    const newUser = this.usersRepository.create({
      ...signUpDto,
      password: passwordHash,
      verificationCode,
      verificationCodeExpiresAt,
    });
    const savedUser = await this.usersRepository.save(newUser);
    if (!savedUser) {
      this.logger.error('Failed to create user in the database');
      throw new InternalServerErrorException(
        'Failed to create user. Please try again later.',
      );
    }
    this.logger.log(
      `User created successfully: ${savedUser.email}. Verification code: ${verificationCode}`,
    );

    // Send verification email
    const emailSent = await this.notificationService.sendVerificationEmail(
      savedUser.firstName,
      savedUser.email,
      verificationCode,
      this.emailVerificationCodeTTL,
    );
    if (!emailSent) {
      this.logger.error(
        `Failed to send verification email to: ${savedUser.email}. Please check your configuration.`,
      );
      // If email sending fails, remove the user from the database
      await this.usersRepository.remove(savedUser); // Clean up the user if email fails
      this.logger.warn(
        `User ${savedUser.email} removed due to email send failure.`,
      );
      // Return a response indicating the email send failure
      throw new InternalServerErrorException(
        'Failed to send verification email. Please contact support.',
      );
    }
    this.logger.log(
      `Verification email sent successfully to: ${savedUser.email}`,
    );

    return {
      message:
        'User created successfully. Please check your email for verification.',
      user: UserMapper.toBasicUser(savedUser),
    };
  }

  async verifyEmailCode(
    verifyEmailCodeDto: VerifyEmailCodeDto,
  ): Promise<VerifyEmailCodeResponse> {
    this.logger.log(
      `Verification code attempt for: ${verifyEmailCodeDto.email}`,
    );

    // Check if user exists
    const user = await this.usersRepository.findOneBy({
      email: verifyEmailCodeDto.email,
    });
    if (!user) {
      this.logger.warn(
        `Verification failed - user not found: ${verifyEmailCodeDto.email}`,
      );
      throw new NotFoundException(
        'Verification failed - user not found',
        'UserNotFound',
      );
    }

    // Check if user is already verified
    if (user.isEmailVerified) {
      user.verificationCode = null; // Clear verification code
      user.verificationCodeExpiresAt = null; // Clear expiration
      await this.usersRepository.save(user);
      this.logger.warn(`Email is already verified: ${user.email}`);
      throw new BadRequestException('Email is already verified. Please login.');
    }

    // Check if verification code and expiration exist
    if (!user.verificationCode || !user.verificationCodeExpiresAt) {
      this.logger.warn(
        `Verification code or expiration not found: ${user.email}`,
      );
      throw new BadRequestException('Verification code not found or expired.');
    }

    // Check if verification code is not expired
    const now = DateTime.utc().toJSDate();
    if (user.verificationCodeExpiresAt < now) {
      this.logger.warn(`Verification code expired: ${user.email}`);
      this.logger.log(
        `Current time: ${now.toISOString()}, Code expires at: ${user.verificationCodeExpiresAt?.toISOString()}`,
      );

      // Send a new verification code
      user.verificationCode = this.generateNumericCode(6);
      user.verificationCodeExpiresAt = DateTime.utc()
        .plus({ minutes: this.emailVerificationCodeTTL })
        .toJSDate();
      await this.usersRepository.save(user);
      await this.notificationService.sendVerificationEmail(
        user.firstName,
        user.email,
        user.verificationCode,
        this.emailVerificationCodeTTL,
      );
      throw new BadRequestException(
        'Verification code expired. A new code has been sent to your email.',
        'NewCodeSentForExpired',
      );
    }

    //  Check if the provided code matches the stored code
    if (user.verificationCode !== verifyEmailCodeDto.code) {
      // If the code is invalid, send a new verification code
      user.verificationCode = this.generateNumericCode(6);
      user.verificationCodeExpiresAt = DateTime.utc()
        .plus({ minute: this.emailVerificationCodeTTL })
        .toJSDate();
      await this.usersRepository.save(user);
      await this.notificationService.sendVerificationEmail(
        user.firstName,
        user.email,
        user.verificationCode,
        this.emailVerificationCodeTTL,
      );
      this.logger.warn(
        `Verification failed - invalid code: ${verifyEmailCodeDto.code} for user: ${user.email}. New code sent: ${user.verificationCode}`,
      );
      throw new BadRequestException(
        'Invalid verification code. Please try again. A new code has been sent to your email.',
        'NewCodeSentForInvalidCode',
      );
    }

    this.logger.log(
      `Verification code matched for user: ${user.email}. Proceeding to verify email.`,
    );

    // Mark user as verified
    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    const updatedUser = await this.usersRepository.save(user);
    if (!updatedUser) {
      this.logger.error(
        `Failed to update user verification status: ${user.email}`,
      );
      throw new InternalServerErrorException(
        'Failed to verify email. Please try again later.',
      );
    }
    this.logger.log(`Email verified successfully for user: ${user.email}.`);

    return {
      message: 'Email verified successfully. You can now log in.',
      user: UserMapper.toBasicUser(updatedUser),
    };
  }

  async resendEmailVerification(
    resendEmailVerificationCodeDto: ResendEmailVerificationCodeDto,
  ): Promise<ResendEmailVerificationResponse> {
    const { email } = resendEmailVerificationCodeDto;
    this.logger.log(`Resend email verification code attempt for: ${email}`);
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      this.logger.warn(
        `Resend email verification failed - user not found: ${email}`,
      );
      throw new NotFoundException('User not found');
    }

    // Generate new verification code and expiration
    user.verificationCode = this.generateNumericCode(6);
    user.verificationCodeExpiresAt = DateTime.utc()
      .plus({ minutes: this.emailVerificationCodeTTL })
      .toJSDate();
    await this.usersRepository.save(user);

    // Send verification email
    const emailSent = await this.notificationService.sendVerificationEmail(
      user.firstName,
      user.email,
      user.verificationCode,
      this.emailVerificationCodeTTL,
    );
    if (!emailSent) {
      this.logger.error(
        `Failed to send verification email to: ${user.email}. Please check your configuration.`,
      );
      throw new InternalServerErrorException(
        'Failed to send verification email',
      );
    }

    this.logger.log(
      `Resent verification email successfully to: ${user.email}. New code: ${user.verificationCode}`,
    );

    return {
      message: 'If this email is registered, a new code has been sent.',
    };
  }

  async signIn(signInDto: SignInDto): Promise<SignInResponse> {
    const { email, password } = signInDto;
    this.logger.log(`Login attempt of: ${email}`);

    // Check if user exists
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      this.logger.warn(`Login failed, user not found: ${email}`);
      throw new UnauthorizedException('Login failed, invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
      this.logger.warn(`Login failed, user is inactive: ${email}`);
      throw new UnauthorizedException(
        'Login failed, user is inactive',
        'User Inactive',
      );
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      this.logger.warn(`Login failed, email not verified: ${email}`);
      throw new UnauthorizedException(
        'Login failed, email not verified. Please verify your email first.',
        'Email Not Verified',
      );
    }

    // Validate credentials
    const isValidCredentials = await this.comparePasswords(
      password,
      user.password,
    );
    if (!isValidCredentials) {
      this.logger.warn(`Login failed - invalid credentials: ${email}`);
      throw new UnauthorizedException('Login failed, invalid credentials');
    }
    this.logger.log(`Login successful for user: ${email}`);

    // Update last login
    await this.updateLastLogin(user.id);

    return {
      access_token: await this.generateJWT(user),
      user: UserMapper.toBasicUser(user),
    };
  }

  async forgotPassword({
    email,
  }: ForgotPasswordDto): Promise<ForgotPasswordResponse> {
    try {
      this.logger.log(`Forgot password attempt for: ${email}`);
      const user = await this.usersRepository.findOneBy({ email });

      // Check if user exists. No send response if user not found for security reasons.
      if (!user) {
        this.logger.warn(`Forgot password failed - user not found: ${email}`);
        return {
          message: 'If this email is registered, a reset code has been sent.',
        };
      }

      // Check if user is active
      if (!user.isActive) {
        this.logger.warn(`Forgot password failed - user is inactive: ${email}`);
        throw new ForbiddenException(
          'Your account is inactive. Please contact support.',
          'User Inactive',
        );
      }

      // Generate reset password code and expiration
      user.passwordResetCode = this.generateNumericCode(6);
      user.passwordResetExpiresAt = DateTime.utc()
        .plus({ minute: this.emailVerificationCodeTTL })
        .toJSDate();
      await this.usersRepository.save(user);

      // Send reset password email
      const emailSent = await this.notificationService.sendResetPasswordEmail(
        user.firstName,
        user.email,
        user.passwordResetCode,
        this.emailVerificationCodeTTL,
      );
      if (!emailSent) {
        this.logger.error(
          `Failed to send reset password email to: ${user.email}. Please check your configuration.`,
        );
        throw new InternalServerErrorException(
          'Failed to send reset password email',
        );
      }

      this.logger.log(
        `Reset password email sent successfully to: ${user.email}. Reset code: ${user.passwordResetCode}`,
      );

      return {
        message:
          'Reset password email sent successfully. Please check your inbox.',
      };
    } catch (error) {
      this.logger.error(`Forgot password failed for: ${email}`, error);
      throw new InternalServerErrorException(
        'Failed to process forgot password request. Please try again later.',
        'Forgot Password Error',
      );
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ResetPasswordResponse> {
    const { email, code, newPassword } = resetPasswordDto;
    this.logger.log(
      `Reset password attempt for: ${email}. At ${DateTime.utc().toISO()}`,
    );

    // Check if user exists
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      this.logger.warn(`Reset password failed - user not found: ${email}`);
      throw new NotFoundException('User not found');
    }

    // Check if user is active
    if (!user.isActive) {
      this.logger.warn(`Reset password failed - user is inactive: ${email}`);
      throw new ForbiddenException(
        'Your account is inactive. Please contact support.',
        'UserInactive',
      );
    }

    // Check if reset code exist
    if (!user.passwordResetCode || !user.passwordResetExpiresAt) {
      this.logger.warn(
        `Reset password code or expiration not found for user: ${user.email}`,
      );
      throw new BadRequestException(
        'Reset code not found.',
        'ResetCodeNotFound',
      );
    }

    // Check if reset code is expired
    const now = DateTime.utc().toJSDate();
    if (user.passwordResetExpiresAt < now) {
      // Send a new reset code
      user.passwordResetCode = this.generateNumericCode(6);
      user.passwordResetExpiresAt = DateTime.utc()
        .plus({ minute: this.emailVerificationCodeTTL })
        .toJSDate();
      await this.usersRepository.save(user);
      await this.notificationService.sendResetPasswordEmail(
        user.firstName,
        user.email,
        user.passwordResetCode,
        this.emailVerificationCodeTTL,
      );
      this.logger.warn(
        `Reset password failed - code expired for user: ${user.email}`,
      );
      throw new BadRequestException(
        'Reset code expired. A new code has been sent to your email.',
        'ResetCodeExpired',
      );
    }

    // Check if the provided code matches the stored code
    if (user.passwordResetCode !== code) {
      // If the code is invalid, send a new reset code
      user.passwordResetCode = this.generateNumericCode(6);
      user.passwordResetExpiresAt = DateTime.utc()
        .plus({ minute: this.emailVerificationCodeTTL })
        .toJSDate();
      await this.usersRepository.save(user);
      await this.notificationService.sendResetPasswordEmail(
        user.firstName,
        user.email,
        user.passwordResetCode,
        this.emailVerificationCodeTTL,
      );
      this.logger.warn(
        `Reset password failed - invalid code: ${code} for user: ${user.email}. New code sent: ${user.passwordResetCode}`,
      );
      throw new BadRequestException(
        'Invalid reset code. A new code has been sent to your email. Please try again.',
        'InvalidResetCode',
      );
    }

    // Hash the new password
    const hashedPassword = await this.hashPassword(newPassword);
    user.password = hashedPassword;
    user.passwordResetCode = null; // Clear reset code
    user.passwordResetExpiresAt = null; // Clear expiration

    // Set email as verified if it was not already
    user.isEmailVerified = true;
    user.verificationCode = null; // Clear verification code
    user.verificationCodeExpiresAt = null; // Clear expiration
    this.logger.log(
      `Email verified for user: ${user.email} during password reset.`,
    );

    const updatedUser = await this.usersRepository.save(user);
    if (!updatedUser) {
      this.logger.error(`Failed to update password for user: ${user.email}`);
      throw new InternalServerErrorException(
        'Failed to reset password. Please try again later.',
      );
    }

    this.logger.log(`Password reset successfully for user: ${user.email}`);

    return { message: 'Password reset successfully. You can now log in.' };
  }

  async resendResetPasswordCode(
    resendResetPasswordCodeDto: ResendResetPasswordCodeDto,
  ): Promise<ResendResetPasswordCodeResponse> {
    const { email } = resendResetPasswordCodeDto;
    this.logger.log(`Resend reset password code attempt for: ${email}`);

    // Check if user exists and send response if not found for security reasons
    const user = await this.usersRepository.findOneBy({ email });
    if (!user) {
      this.logger.warn(
        `Resend reset password code failed - user not found: ${email}`,
      );
      return {
        message: 'If this email is registered, a reset code has been sent.',
      };
    }

    // Check if user is active
    if (!user.isActive) {
      this.logger.warn(
        `Resend reset password code failed - user is inactive: ${email}`,
      );
      throw new ForbiddenException(
        'Your account is inactive. Please contact support.',
        'UserInactive',
      );
    }

    // Check if reset code and expiration exist
    if (!user.passwordResetCode || !user.passwordResetExpiresAt) {
      this.logger.warn(
        `Reset password code or expiration not found for user: ${user.email}`,
      );
      throw new BadRequestException(
        'Reset code not found or expired. Please try again.',
      );
    }

    // Generate new reset code and expiration
    user.passwordResetCode = this.generateNumericCode(6);
    user.passwordResetExpiresAt = DateTime.utc()
      .plus({ minute: this.emailVerificationCodeTTL })
      .toJSDate();
    await this.usersRepository.save(user);

    // Send reset password email
    const emailSent = await this.notificationService.sendResetPasswordEmail(
      user.firstName,
      user.email,
      user.passwordResetCode,
      this.emailVerificationCodeTTL,
    );
    if (!emailSent) {
      this.logger.error(
        `Failed to send reset password email to: ${user.email}. Please check your configuration.`,
      );
      throw new InternalServerErrorException(
        'Failed to send reset password email',
      );
    }

    this.logger.log(
      `Resent reset password email successfully to: ${user.email}. New code: ${user.passwordResetCode}`,
    );

    return {
      message:
        'Reset password email resent successfully. Please check your inbox.',
    };
  }

  async changePassword(
    changePasswordDto: ChangePasswordDto,
    user: User,
  ): Promise<ChangePasswordResponse> {
    const { currentPassword, newPassword } = changePasswordDto;
    this.logger.log(`Change password attempt for user: ${user.email}`);

    const existingUser = await this.usersRepository.findOneBy({ id: user.id });

    // Check if old password is correct
    const isValidPassword = await this.comparePasswords(
      currentPassword,
      existingUser.password,
    );
    if (!isValidPassword) {
      this.logger.warn(
        `Change password failed - invalid current password for user: ${user.email}`,
      );
      throw new BadRequestException('Invalid current password');
    }

    existingUser.password = await this.hashPassword(newPassword);
    const updatedUser = await this.usersRepository.save(existingUser);
    if (!updatedUser) {
      this.logger.error(`Failed to update password for user: ${user.email}`);
      throw new InternalServerErrorException(
        'Failed to change password. Please try again later.',
      );
    }

    this.logger.log(`Password changed successfully for user: ${user.email}`);
    return {
      message: 'Password changed successfully',
      user: UserMapper.toBasicUser(updatedUser),
    };
  }

  async deleteAccount(
    deleteAccountDto: DeleteAccountDto,
    user: User,
  ): Promise<DeleteAccountResponse> {
    this.logger.log(`Delete account attempt for user: ${user.email}`);

    // Check if user exists
    const existingUser = await this.usersRepository.findOneBy({ id: user.id });
    if (!existingUser) {
      this.logger.warn(`Delete account failed - user not found: ${user.email}`);
      throw new NotFoundException('User not found');
    }

    // Check if user is active
    if (!existingUser.isActive) {
      this.logger.warn(
        `Delete account failed - user is inactive: ${user.email}`,
      );
      throw new ForbiddenException(
        'Your account is inactive. Please contact support.',
        'UserInactive',
      );
    }

    // Check if password is correct
    const isValidPassword = await this.comparePasswords(
      deleteAccountDto.password,
      existingUser.password,
    );
    if (!isValidPassword) {
      this.logger.warn(
        `Delete account failed - invalid password for user: ${user.email}`,
      );
      throw new BadRequestException('Invalid password');
    }

    // Delete user
    await this.usersRepository.remove(existingUser);
    this.logger.log(`Account deleted successfully for user: ${user.email}`);

    return {
      message:
        'Account deleted successfully. We are sorry to see you go. But we hope to see you again in the future.',
      user: UserMapper.toBasicUser(existingUser),
    };
  }

  async checkStatus(user: User): Promise<CheckStatusResponse> {
    this.logger.log(`Checking status for user: ${user.email}`);

    // Check if user exists
    const existingUser = await this.usersRepository.findOneBy({ id: user.id });
    if (!existingUser) {
      this.logger.warn(`User not found: ${user.email}`);
      throw new NotFoundException('User not found');
    }

    // Check if user is active
    if (!existingUser.isActive) {
      this.logger.warn(`User is inactive: ${user.email}`);
      throw new UnauthorizedException(
        'Your account is inactive. Please contact support.',
        'UserInactive',
      );
    }

    // Check if email is verified
    if (!existingUser.isEmailVerified) {
      this.logger.warn(`Email not verified for user: ${user.email}`);
      throw new UnauthorizedException(
        'Email not verified. Please verify your email first.',
        'EmailNotVerified',
      );
    }

    this.logger.log(`User status check successful for: ${user.email}`);
    return {
      access_token: await this.generateJWT(existingUser),
      user: UserMapper.toBasicUser(existingUser),
    };
  }

  async updateProfile(
    updateProfileDto: UpdateProfileDto,
    user: User,
  ): Promise<UpdateProfileResponse> {
    const { password, ...userData } = updateProfileDto;

    let updatedUser: User;

    try {
      if (password) {
        const newPassword = bcrypt.hashSync(password, 10);

        updatedUser = await this.usersRepository.preload({
          id: user.id,
          password: newPassword,
          ...userData,
        });

        await this.usersRepository.save(updatedUser);
        return {
          message: 'Profile updated successfully',
          user: UserMapper.toBasicUser(updatedUser),
        };
      }

      updatedUser = await this.usersRepository.preload({
        id: user.id,
        ...userData,
      });

      await this.usersRepository.save(updatedUser);
      return {
        message: 'Profile updated successfully',
        user: UserMapper.toBasicUser(updatedUser),
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        `Failed to update profile for user ${user.id}.`,
      );
    }
  }

  private async generateJWT(user: User): Promise<string> {
    const payload: JwtPayload = { id: user.id, email: user.email };
    return this.jwtService.signAsync(payload);
  }

  private async comparePasswords(
    plainPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);

    return bcrypt.hash(password, salt);
  }

  private async updateLastLogin(id: string): Promise<boolean> {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      return false;
    }

    user.lastLoginAt = DateTime.utc().toJSDate();

    await this.usersRepository.save(user);
    return true;
  }

  private generateNumericCode(length: number): string {
    let code = '';
    const characters = '0123456789';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }
}
