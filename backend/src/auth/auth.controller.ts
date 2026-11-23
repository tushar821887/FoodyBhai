import { Controller, Post, Body, HttpCode, HttpStatus, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('guest-set-password')
  @HttpCode(HttpStatus.OK)
  async guestSetPassword(@Body() body: { identifier: string; password: string }) {
    if (!body || !body.identifier || !body.password) {
      throw new BadRequestException('Identifier and password are required.');
    }
    return this.authService.guestSetPassword(body.identifier, body.password);
  }

  @Post('forgot-password/send-otp')
  @HttpCode(HttpStatus.OK)
  async sendForgotPasswordOtp(@Body() body: { identifier: string }) {
    if (!body || !body.identifier) {
      throw new BadRequestException('Please provide your registered Email or Phone Number.');
    }
    return this.authService.sendForgotPasswordOtp(body.identifier);
  }

  @Post('forgot-password/verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyForgotPasswordOtp(@Body() body: { identifier: string; otp: string }) {
    if (!body || !body.identifier || !body.otp) {
      throw new BadRequestException('Identifier and 6-digit OTP code are required.');
    }
    return this.authService.verifyForgotPasswordOtp(body.identifier, body.otp);
  }

  @Post('forgot-password/reset')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithToken(@Body() body: { identifier: string; resetToken: string; newPassword: string }) {
    if (!body || !body.identifier || !body.resetToken || !body.newPassword) {
      throw new BadRequestException('Identifier, resetToken, and New Password are required.');
    }
    return this.authService.resetPasswordWithToken(body.identifier, body.resetToken, body.newPassword);
  }
}
