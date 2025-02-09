import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import { GetUser, Auth } from './decorators';
import { VerifyUserDto } from './dto/verify-user.dto';
import { SendCodeDto } from './dto/send-code.dto';
import { SignupUserDto } from './dto/signup-user.dto';

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
  resetPassword(@Body() { username }: { username: string }) {
    return this.authService.resetPassword(username);
  }

  @Post('change-password')
  @Auth()
  changePassword(
    @Body() { password }: { password: string },
    @GetUser() user: User,
  ) {
    return this.authService.changePassword(user, password);
  }
}
