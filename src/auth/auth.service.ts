import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import {
  ChangePasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyCodeDto,
} from './dto';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from 'src/users/users.service';
import { UtilityService } from 'src/utility/utility.service';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
    private readonly utilityService: UtilityService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signUpDto: SignUpDto) {
    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException(
        'User with this email already exists. Please login.',
      );
    }

    const hashedPassword = await this.utilityService.hashPassword(
      signUpDto.password,
    );

    const verificationCode = this.utilityService.generateNumericCode(6);
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setHours(
      verificationCodeExpiresAt.getHours() + 1,
    );

    const newUser: Partial<User> = {
      name: signUpDto.name,
      lastName: signUpDto.lastName,
      email: signUpDto.email,
      password: hashedPassword,
      countryCode: signUpDto.countryCode || null,
      phoneNumber: signUpDto.phoneNumber || null,
      isEmailVerified: false,
      verificationCode: verificationCode,
      verificationCodeExpiresAt: verificationCodeExpiresAt,
      passwordResetCode: null,
      passwordResetExpiresAt: null,
    };

    try {
      const user = await this.usersService.create(newUser);

      await this.notificationService.sendEmailVerificationCode(
        user.name,
        user.email,
        verificationCode,
      );

      const accounts =
        await this.utilityService.createDefaultAccountAndAccountType(user);
      if (!accounts) {
        throw new InternalServerErrorException(
          'Failed to create default account and type',
        );
      }

      this.logger.log('User registered successfully. Verification code sent.');

      return {
        message: 'User registered successfully. Verification code sent.',
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error('Error during signup process:', error);
      // Rethrow generic internal error for unexpected issues (DB errors etc.)
      throw new InternalServerErrorException(
        'An error occurred during user registration.',
      );
    }
  }

  async verifyCode(verifyCodeDto: VerifyCodeDto) {
    const user = await this.usersService.findByEmail(verifyCodeDto.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('Email is already verified.');
    }

    const now = new Date();
    if (
      user.verificationCode !== verifyCodeDto.code ||
      !user.verificationCode ||
      !user.verificationCodeExpiresAt ||
      user.verificationCodeExpiresAt < now
    ) {
      if (user) {
        user.verificationCode = null;
        user.verificationCodeExpiresAt = null;
        this.usersService
          .update(user.id, user)
          .catch((error) =>
            console.error(
              'Failed to clear code on failed verification attempt:',
              error,
            ),
          );
      }

      const newVerificationCode = this.utilityService.generateNumericCode(6);
      const newVerificationCodeExpiresAt = new Date();
      newVerificationCodeExpiresAt.setHours(
        newVerificationCodeExpiresAt.getHours() + 1,
      );

      await this.notificationService.sendEmailVerificationCode(
        user.name,
        user.email,
        newVerificationCode,
      );
      user.verificationCode = newVerificationCode;
      user.verificationCodeExpiresAt = newVerificationCodeExpiresAt;
      try {
        await this.usersService.update(user.id, user); // Save the updated user status
      } catch (error) {
        console.error('Error updating user verification status:', error);
        throw new InternalServerErrorException(
          'An error occurred during verification.',
        );
      }
      throw new BadRequestException(
        'Invalid or expired verification code. A new code has been sent to your email.',
      );
    }

    user.isEmailVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpiresAt = null;
    user.isActive = true;

    try {
      await this.usersService.update(user.id, user);

      this.logger.log(`Email verified successfully (${user.email})`);

      return {
        message: `Email verified successfully.`,
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles,
          createdAt: user.createdAt,
        },
      };
    } catch (error) {
      console.error('Error updating user verification status:', error);
      throw new InternalServerErrorException(
        'An error occurred during verification.',
      );
    }
  }

  async signin(signInDto: SignInDto) {
    const user = await this.usersService.findByEmail(signInDto.email);

    // Check if user exists and password matches
    // Use a generic message for security (don't say if email incorrect or password wrong)
    if (
      !user ||
      !(await this.utilityService.comparePasswords(
        signInDto.password,
        user.password,
      ))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      // Adjust if phone verification is sufficient for login
      // You might throw UnauthorizedException or BadRequestException
      // throw new UnauthorizedException('Email is not verified.');
      // Or redirect to verification flow
      throw new BadRequestException('Please verify your email address.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException({
        error: 'Unauthorized',
        message: 'The user is inactive, please contact support.',
        statusCode: 401,
        cause: 'inactive',
      });
    }

    // Generate and return a JWT access token
    const accessToken = this.generateToken({
      id: user.id,
    }); // generateToken uses user object for payload

    return {
      user: {
        id: user.id,
        name: user.name,
        lastName: user.lastName,
        email: user.email,
        countryCode: user.countryCode,
        phoneNumber: user.phoneNumber,
        birthdate: user.birthdate,
        lastLogin: user.lastLogin,
        roles: user.roles,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token: accessToken,
    };
  }

  async getAuthenticatedUserProfile(userId: string) {
    // Replace 'any' with User entity type excluding sensitive fields
    const user = await this.usersService.findOne(userId); // Assuming usersService.findById exists
    if (!user) {
      throw new NotFoundException('User not found'); // Should ideally not happen if auth guard works, but defensive
    }

    // Return only non-sensitive fields (e.g., name, lastName, email, birthdate, isEmailVerified, isPhoneVerified)
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      verificationCode,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      verificationCodeExpiresAt,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordResetCode,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordResetExpiresAt,
      ...profile
    } = user;
    return profile;
  }

  async deleteAccount(userId: string, passwordConfirmation: string) {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await this.utilityService.comparePasswords(
      passwordConfirmation,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect password confirmation'); // Use Unauthorized for wrong password
    }

    try {
      await this.usersService.remove(userId);
      return { message: 'Account deleted successfully' };
    } catch (error) {
      console.error('Error during account deletion:', error);
      throw new InternalServerErrorException(
        'An error occurred while deleting account.',
      );
    }
  }

  checkStatus(user: User) {
    return {
      user,
      token: this.generateToken({
        id: user.id,
      }),
    };
  }

  private generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload); // Options like expiry are usually set in JwtModule config
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.usersService.findOne(userId);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordCorrect = await this.utilityService.comparePasswords(
      changePasswordDto.oldPassword,
      user.password,
    );
    if (!isPasswordCorrect) {
      throw new UnauthorizedException('Incorrect old password'); // Use Unauthorized for wrong password
    }

    const hashedNewPassword = await this.utilityService.hashPassword(
      changePasswordDto.newPassword,
    );

    const updateData = { password: hashedNewPassword };

    try {
      await this.usersService.update(userId, updateData);

      // TODO: Send confirmation email via NotificationService
      // await this.notificationService.sendPasswordChangedConfirmation(user.email);
    } catch (error) {
      console.error('Error during password change:', error);
      throw new InternalServerErrorException(
        'An error occurred while changing password.',
      );
    }
  }

  async forgotPassword(email: string): Promise<void> {
    this.logger.log(`Forgot password process initiated for: ${email}`);
    // Find the User by Email - DO NOT throw error if not found
    const user = await this.usersService.findByEmail(email);

    if (user && user.isEmailVerified && user.isActive) {
      const expirationTime: number =
        Number(process.env.EMAIL_VERIFICATION_EXPIRY) || 15; // Default to 15 minutes if not set
      const passwordResetCode = this.utilityService.generateNumericCode(6); // Code for password reset
      const passwordResetExpiresAt = new Date();
      passwordResetExpiresAt.setMinutes(
        passwordResetExpiresAt.getMinutes() + expirationTime,
      );

      // Save the code and its expiry time to the user record
      user.passwordResetCode = passwordResetCode;
      user.passwordResetExpiresAt = passwordResetExpiresAt;

      try {
        // Save the User with the New Code and Expiry
        await this.usersService.update(user.id, user);

        // Send the Email Containing the Reset CODE (NotificationService handles its own errors here)
        await this.notificationService.sendPasswordResetCodeEmail(
          user.name,
          user.email,
          passwordResetCode,
          expirationTime,
        );

        this.logger.log(
          `Password reset code process completed (email sent attempt) for user: ${user.email}`,
        );
      } catch (dbOrEmailError) {
        console.error(
          'Error saving reset code or sending password reset email in service:',
          dbOrEmailError,
        );
        // IMPORTANT: Do NOT re-throw a public error here. Absorb the error for security.
      }
    }
    //! If user not found or email sending failed, the process still "completes" from the client's perspective,
    //! ensuring the controller returns the generic success message.
    //! No return value is needed as the controller returns a fixed message.
  }

  async passwordReset(resetPasswordDto: ResetPasswordDto) {
    // Find the User by Email first
    const user = await this.usersService.findByEmail(resetPasswordDto.email);

    // Validate the Code and Expiry
    const now = new Date();
    // Check if user found, if code exists, matches, and is not expired
    if (
      !user ||
      user.passwordResetCode !== resetPasswordDto.code ||
      !user.passwordResetCode || // Check if a code was actually stored
      !user.passwordResetExpiresAt || // Check if expiry was set
      user.passwordResetExpiresAt < now
    ) {
      // Clear the code immediately if it's wrong or expired (if user found)
      if (user) {
        // user.passwordResetCode = null;
        // user.passwordResetExpiresAt = null;
        // // Use a non-awaited update here for speed on failed attempts
        // this.usersService
        //   .update(user.id, user)
        //   .catch((err) =>
        //     console.error('Failed to clear code on failed reset attempt:', err),
        //   );
        // TODO: Implement rate limiting here based on user email or IP!
        // Implement basic rate limiting
        const attempts = this.utilityService.getRateLimitAttempts(
          resetPasswordDto.email,
        );
        if (attempts > 5) {
          // Allow 5 attempts per hour
          throw new BadRequestException(
            'Too many restart attempts. Please try again in an hour.',
          );
        }
        this.utilityService.incrementRateLimitAttempts(resetPasswordDto.email);
      }
      // Use a generic message for security
      throw new BadRequestException(
        'Invalid or expired reset code. Please try again.',
      );
    }

    // ** Important Security Step: Clear the code immediately AFTER successful validation, before hashing/saving new password **
    // This ensures the code is single-use.
    user.passwordResetCode = null;
    user.passwordResetExpiresAt = null;

    // Hash the new password
    const hashedNewPassword = await this.utilityService.hashPassword(
      resetPasswordDto.newPassword,
    );
    user.password = hashedNewPassword; // Update password

    try {
      // Save the Updated User (new password and nullified code)
      await this.usersService.update(user.id, user);

      // Optional: Invalidate User's Other Active Sessions
      // await this.invalidateUserSessions(user.id);

      // Optional: Send confirmation email
      // await this.notificationService.sendPasswordChangedConfirmation(user.email);

      return {
        message: 'Password reset successfully.',
        user: {
          id: user.id,
          name: user.name,
          lastName: user.lastName,
          email: user.email,
          roles: user.roles,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
      };
    } catch (error) {
      // Catch errors during DB update or confirmation email send
      this.logger.error(
        `Error updating user password after reset: ${error.message}`,
      );
      throw new InternalServerErrorException(
        'An error occurred during password reset.',
      );
    }
  }
}
