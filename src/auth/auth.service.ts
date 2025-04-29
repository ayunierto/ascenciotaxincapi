import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import {
  SignInDto,
  SignUpDto,
  ResetPasswordWithCodeDto,
  VerifyCodeDto,
} from './dto';
import { NotificationService } from '../notification/notification.service';
import { UsersService } from 'src/users/users.service';
import { UtilityService } from 'src/utility/utility.service';
import { JwtPayload } from './interfaces';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly usersService: UsersService,
    private readonly notificationService: NotificationService,
    private readonly utilityService: UtilityService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Processes the user signup request (Email verification ONLY).
   * @param signUpDto The signup data.
   * @returns Basic user info on successful creation.
   * @throws ConflictException if user already exists.
   * @throws InternalServerErrorException on other errors.
   */
  async signup(signUpDto: SignUpDto) {
    const existingUser = await this.usersService.findByEmail(signUpDto.email);
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await this.utilityService.hashPassword(
      signUpDto.password,
    );
    const verificationCode = this.utilityService.generateNumericCode(6); // Code for email verification
    const verificationCodeExpiresAt = new Date();
    verificationCodeExpiresAt.setHours(
      verificationCodeExpiresAt.getHours() + 1,
    ); // Code valid for 1 hour

    // Create User Entity/Object - Ensure your User entity has these fields
    const newUser: Partial<User> = {
      name: signUpDto.name,
      lastName: signUpDto.lastName,
      email: signUpDto.email,
      password: hashedPassword,
      countryCode: signUpDto.countryCode || null,
      phoneNumber: signUpDto.phoneNumber || null,
      isEmailVerified: false, // Initially not verified
      verificationCode: verificationCode,
      verificationCodeExpiresAt: verificationCodeExpiresAt,
      passwordResetCode: null,
      passwordResetExpiresAt: null,
    };

    try {
      const user = await this.usersService.create(newUser); // Save user to DB

      // Send Verification Code via Email (ONLY)
      await this.notificationService.sendEmailVerificationCode(
        user.name,
        user.email,
        verificationCode,
      );

      // Create Default Account and Account Type
      const accounts =
        await this.utilityService.createDesfaultAccountAndType(user);
      if (!accounts) {
        throw new InternalServerErrorException(
          'Failed to create default account and type',
        );
      }

      return {
        message: 'User registered successfully. Verification code sent.',
        userId: user.id, // Assuming user object returned by usersService.create has an id
        email: user.email,
        // Don't return sensitive data like password or verification codes
      };
    } catch (error) {
      console.error('Error during signup process:', error);
      // Rethrow generic internal error for unexpected issues (DB errors etc.)
      throw new InternalServerErrorException(
        'An error occurred during user registration.',
      );
    }
  }

  /**
   * Processes the email code verification request (Email verification ONLY).
   * @param verifyCodeDto The verification data (email, code).
   * @returns Success message and updated verification status.
   * @throws NotFoundException if user not found.
   * @throws BadRequestException if already verified or invalid/expired code.
   * @throws InternalServerErrorException on other errors.
   */
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
      !user.verificationCode || // Check if a code actually exists
      !user.verificationCodeExpiresAt || // Check if expiry was set
      user.verificationCodeExpiresAt < now
    ) {
      // Clear the code immediately if it's wrong or expired
      if (user) {
        user.verificationCode = null;
        user.verificationCodeExpiresAt = null;
        this.usersService
          .update(user.id, user)
          .catch((err) =>
            console.error(
              'Failed to clear code on failed verification attempt:',
              err,
            ),
          );
      }

      const newVerificationCode = this.utilityService.generateNumericCode(6); // New code for email verification
      const newVerificationCodeExpiresAt = new Date();
      newVerificationCodeExpiresAt.setHours(
        newVerificationCodeExpiresAt.getHours() + 1,
      ); // Code valid for 1 hour

      await this.notificationService.sendEmailVerificationCode(
        user.name,
        user.email,
        newVerificationCode,
      );
      // Save the new code and expiry time to the user record
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
      // Use a generic message for security
      throw new BadRequestException(
        'Invalid or expired verification code. A new code has been sent to your email.',
      );
    }

    // If code is valid and not expired: Mark Email as Verified and Clear Code/Expiry
    user.isEmailVerified = true;
    user.verificationCode = null; // Clear the used code
    user.verificationCodeExpiresAt = null; // Clear the expiry timestamp
    user.isActive = true;

    try {
      await this.usersService.update(user.id, user); // Save the updated user status

      return {
        message: `Email verified successfully.`,
        isEmailVerified: user.isEmailVerified,
        // Removed isPhoneVerified from return
      };
    } catch (error) {
      console.error('Error updating user verification status:', error);
      throw new InternalServerErrorException(
        'An error occurred during verification.',
      );
    }
  }

  /**
   * Processes the user signin request.
   * @param signInDto The signin credentials.
   * @returns An object containing the access token.
   * @throws UnauthorizedException if credentials are invalid or email not verified.
   * @throws InternalServerErrorException on other errors.
   */
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
      user,
      token: accessToken,
    };
  }

  /**
   * Gets the profile information for the authenticated user.
   * @param userId The ID of the authenticated user.
   * @returns The user profile data (without sensitive info).
   * @throws NotFoundException if user not found (e.g., deleted).
   */
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

  async deleteAccount(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException();
    await this.userRepository.remove(user);
    return user;
  }

  checkStatus(user: User) {
    return {
      user,
      token: this.generateToken({
        id: user.id,
      }),
    };
  }

  /**
   * Generates a JWT token for a user.
   * @param user The user entity or object with payload data (e.g., id, email).
   * @returns The generated JWT access token.
   */
  private generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload); // Options like expiry are usually set in JwtModule config
  }

  // private getJwtToken(payload: JwtPayload) {
  //   return this.jwtService.sign(payload);
  // }

  // async changePassword(user: User, changePasswordDto: ChangePasswordDto) {
  //   const userDB = await this.userRepository.findOneBy({ id: user.id });

  //   if (!userDB) throw new NotFoundException('User not found');

  //   const newPassword = this.utilityService.hashPassword(changePasswordDto.password);
  //   await this.userRepository.save({
  //     ...userDB,
  //     password: newPassword,
  //   });
  //   return { user: userDB, token: this.getJwtToken({ id: user.id }) };
  // }

  /**
   * Processes the forgot password request (sends the reset code via email).
   * This method handles finding the user, generating/saving the code, and sending the email.
   * It is designed to return successfully even if the user is not found for security.
   * @param email The email address to send the reset code to.
   * @returns A Promise that resolves when the process is complete (successfully or not from a security standpoint).
   */
  async processForgotPassword(email: string): Promise<void> {
    // Find the User by Email - DO NOT throw error if not found
    const user = await this.usersService.findByEmail(email);

    // If User Found, Generate Code, Set Expiry, Save, and Send Email
    if (user /* && user.isEmailVerified */) {
      // Optional: check if email is verified

      const passwordResetCode = this.utilityService.generateNumericCode(6); // Code for password reset
      const passwordResetExpiresAt = new Date();
      passwordResetExpiresAt.setMinutes(
        passwordResetExpiresAt.getMinutes() + 15,
      ); // Code valid for 15 min

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
        );

        console.log(
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
    // If user not found or email sending failed, the process still "completes" from the client's perspective,
    // ensuring the controller returns the generic success message.
    // No return value is needed as the controller returns a fixed message.
  }

  /**
   * Processes the password reset request using the code.
   * @param resetPasswordWithCodeDto The data containing email, code, and new password.
   * @returns A Promise indicating success.
   * @throws BadRequestException if code is invalid/expired.
   * @throws NotFoundException if user not found by email.
   * @throws InternalServerErrorException on other errors.
   */
  async processPasswordResetWithCode(
    resetPasswordWithCodeDto: ResetPasswordWithCodeDto,
  ): Promise<void> {
    // Find the User by Email first
    const user = await this.usersService.findByEmail(
      resetPasswordWithCodeDto.email,
    );

    // Validate the Code and Expiry
    const now = new Date();
    // Check if user found, if code exists, matches, and is not expired
    if (
      !user ||
      user.passwordResetCode !== resetPasswordWithCodeDto.code ||
      !user.passwordResetCode || // Check if a code was actually stored
      !user.passwordResetExpiresAt || // Check if expiry was set
      user.passwordResetExpiresAt < now
    ) {
      // Clear the code immediately if it's wrong or expired (if user found)
      if (user) {
        user.passwordResetCode = null;
        user.passwordResetExpiresAt = null;
        // Use a non-awaited update here for speed on failed attempts
        this.usersService
          .update(user.id, user)
          .catch((err) =>
            console.error('Failed to clear code on failed reset attempt:', err),
          );
        // Implement rate limiting here based on user email or IP!
      }
      // Use a generic message for security
      throw new BadRequestException('Invalid or expired reset code.');
    }

    // ** Important Security Step: Clear the code immediately AFTER successful validation, before hashing/saving new password **
    // This ensures the code is single-use.
    user.passwordResetCode = null;
    user.passwordResetExpiresAt = null;

    // Hash the new password
    const hashedNewPassword = await this.utilityService.hashPassword(
      resetPasswordWithCodeDto.newPassword,
    );
    user.password = hashedNewPassword; // Update password

    try {
      // Save the Updated User (new password and nullified code)
      await this.usersService.update(user.id, user);

      // Optional: Invalidate User's Other Active Sessions
      // await this.invalidateUserSessions(user.id);

      // Optional: Send confirmation email
      // await this.notificationService.sendPasswordChangedConfirmation(user.email);
    } catch (error) {
      // Catch errors during DB update or confirmation email send
      console.error('Error updating user password after reset:', error);
      throw new InternalServerErrorException(
        'An error occurred during password reset.',
      );
    }
  }
}
