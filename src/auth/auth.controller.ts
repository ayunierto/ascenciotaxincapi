import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser, Auth } from './decorators';
import { VerifyUserDto } from './dto/verify-user.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  signup(@Body() signupUserDto: SignupUserDto) {
    return this.authService.signup(signupUserDto);
  }

  @Post('signin')
  signin(@Body() loginUserDto: LoginUserDto) {
    return this.authService.signin(loginUserDto);
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
  verifyCode(@Body() verifyUserDto: VerifyUserDto) {
    return this.authService.verifyCode(verifyUserDto);
  }

  @Post('resend-code')
  resendCode(@Body() sendCodeDto: SendCodeDto) {
    return this.authService.sendVerificationCode(sendCodeDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @Auth()
  changePassword(
    @Body() changePasswordDto: ChangePasswordDto,
    @GetUser() user: User,
  ) {
    return this.authService.changePassword(user, changePasswordDto);
  }
}
