import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { GetUser, Auth } from './decorators';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { NotificationService } from 'src/notification/notification.service';
import { SignInDto, SignUpDto, VerifyCodeDto } from './dto';
import { ResetPasswordWithCodeDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
  ) {}

  @Post('signup')
  signup(@Body() signUpDto: SignUpDto) {
    return this.authService.signup(signUpDto);
  }

  @Post('signin')
  signin(@Body() signInDto: SignInDto) {
    return this.authService.signin(signInDto);
  }

  @Post('delete-account')
  @Auth()
  deleteAccount(@GetUser() { id }: User) {
    return this.authService.deleteAccount(id);
  }

  @Get('check-status')
  @Auth()
  checkAuthStatus(
    @GetUser()
    user: User,
  ) {
    return this.authService.checkStatus(user);
  }

  @Post('verify-code')
  verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(verifyCodeDto);
  }

  // @Post('resend-code')
  // resendCode(@Body() sendCodeDto: SendCodeDto) {
  //   return this.notificationService.sendVerificationCode(sendCodeDto);
  // }

  // @Post('change-password')
  // @Auth()
  // changePassword(
  //   @Body() changePasswordDto: ChangePasswordDto,
  //   @GetUser() user: User,
  // ) {
  //   return this.authService.changePassword(user, changePasswordDto);
  // }

  // Forgot Password
  @Post('forgot-password')
  forfotPassword(@Body() forgotPassword: ForgotPasswordDto) {
    return this.authService.processForgotPassword(forgotPassword.email);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      // Delegate the entire process to the service
      await this.authService.processForgotPassword(forgotPasswordDto.email);
      // Always return the generic success message as required for security
      return {
        message:
          'If an account with that email address exists, a password reset code has been sent.',
      };
    } catch (error) {
      // As discussed, for forgotPassword, we usually want to return the generic success message
      // even for unexpected errors, for security.
      console.error('Unexpected error in forgot password flow:', error);
      return {
        message:
          'If an account with that email address exists, a password reset code has been sent.',
      };
    }
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordWithCodeDto: ResetPasswordWithCodeDto) {
    return this.authService.processPasswordResetWithCode(
      resetPasswordWithCodeDto,
    );
  }
}
