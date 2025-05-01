import {
  Controller,
  Post,
  Body,
  Get,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';

import { NotificationService } from 'src/notification/notification.service';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { GetUser, Auth } from './decorators';
import {
  ChangePasswordDto,
  DeleteAccountDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
  VerifyCodeDto,
} from './dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('signup')
  async signup(@Body() signUpDto: SignUpDto) {
    return await this.authService.signup(signUpDto);
  }

  @Post('verify-code')
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return await this.authService.verifyCode(verifyCodeDto);
  }

  @Post('signin')
  async signin(@Body() signInDto: SignInDto) {
    return await this.authService.signin(signInDto);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser()
    user: User,
  ) {
    return this.authService.checkStatus(user);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      await this.authService.forgotPassword(forgotPasswordDto.email);
      // Always return the generic success message as required for security
      return {
        message:
          'If an account with that email address exists, a password reset code has been sent.',
      };
    } catch (error) {
      console.error('Unexpected error in forgot password flow:', error);
      return {
        message:
          'If an account with that email address exists, a password reset code has been sent.',
      };
    }
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.passwordReset(resetPasswordDto);
  }

  // @Post('resend-code')
  // resendCode(@Body() sendCodeDto: SendCodeDto) {
  //   return this.notificationService.sendVerificationCode(sendCodeDto);
  // }

  // Other operations of the user
  // @Post('change-password')
  // @Auth()
  // changePassword(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.authService.changePassword(user, changePasswordDto);
  // }

  @Post('change-password')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ) {
    await this.authService.changePassword(user.id, changePasswordDto);
    return { message: 'Password changed successfully' };
  }

  @Post('delete-account')
  @Auth()
  async deleteAccount(
    @GetUser() user: User,
    @Body() deleteAccountDto: DeleteAccountDto,
  ) {
    return await this.authService.deleteAccount(
      user.id,
      deleteAccountDto.password,
    );
  }
}
