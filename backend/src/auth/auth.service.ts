import { Injectable, UnauthorizedException, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { AgentsService } from '../agents/agents.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload } from './strategies/jwt.strategy';
import * as crypto from 'crypto';
import { SettingsService } from '../settings/settings.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly agentsService: AgentsService,
    private readonly jwtService: JwtService,
    private readonly settingsService: SettingsService,
  ) {}

  generateTokenForUser(user: any): string {
    const payload: JwtPayload = {
      sub: user._id ? user._id.toString() : user.id,
      email: user.email,
      role: user.role || 'user',
    };
    return this.jwtService.sign(payload);
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.createUser(
      registerDto.name,
      registerDto.email,
      registerDto.password,
      registerDto.phone,
    );

    this.logger.log(`User registered: ${user.email}`);

    return {
      success: true,
      message: 'Registration successful',
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        needsPasswordSet: false,
      },
    };
  }

  async login(loginDto: LoginDto) {
    const identifier = (loginDto.email || '').trim();
    let user = await this.usersService.findByEmailOrPhone(identifier);
    let role = user ? user.role : null;
    let passwordHash = user ? user.passwordHash : null;
    let userId = user ? user._id.toString() : null;
    let name = user ? user.name : null;
    let phone = user ? user.phone : null;
    let email = user ? user.email : identifier.toLowerCase();
    let needsPasswordSet = user ? (user as any).needsPasswordSet : false;

    if (!user) {
      const agent = await this.agentsService.findByEmail(identifier.toLowerCase());
      if (agent) {
        role = 'agent';
        passwordHash = agent.passwordHash || '';
        userId = agent._id.toString();
        name = agent.name;
        phone = agent.phone;
        email = agent.email || identifier.toLowerCase();
        user = agent as any;
      }
    }

    if (!user) {
      throw new UnauthorizedException('Invalid email, phone number, or password');
    }

    // If guest user without password
    if (!passwordHash || needsPasswordSet) {
      throw new UnauthorizedException({
        guestNeedsPassword: true,
        email: email,
        phone: phone,
        name: name,
        message: 'This guest account does not have a password set yet. Please create a password to log in, or track your live order.'
      });
    }

    let isPasswordValid = false;
    if (passwordHash && !passwordHash.startsWith('$2')) {
      isPasswordValid = (loginDto.password === passwordHash);
    } else {
      isPasswordValid = await bcrypt.compare(loginDto.password, passwordHash || '');
    }
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: userId as string,
      email: email,
      role: role as string,
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`User logged in: ${email}`);

    return {
      success: true,
      message: 'Login successful',
      accessToken,
      user: {
        id: userId,
        name: name,
        email: email,
        role: role,
        phone: phone,
        needsPasswordSet: false,
      },
    };
  }

  async guestSetPassword(identifier: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('Password must be at least 6 characters long.');
    }
    const cleanId = (identifier || '').trim();
    const user = await this.usersService.findByEmailOrPhone(cleanId);
    if (!user) {
      throw new NotFoundException('Account not found with this email or phone number.');
    }

    // Hash and set password
    const updatedUser = await this.usersService.setPassword(user._id.toString(), newPassword);
    if (!updatedUser) {
      throw new BadRequestException('Could not set password. Please try again.');
    }

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
    };

    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Guest password created and logged in: ${user.email}`);

    return {
      success: true,
      message: 'Password created successfully! You are now logged in.',
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        needsPasswordSet: false,
      },
    };
  }

  private maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email || '';
    const [user, domain] = email.split('@');
    if (user.length <= 2) return `${user[0]}*@${domain}`;
    return `${user.substring(0, 2)}***${user.substring(user.length - 1)}@${domain}`;
  }

  private maskPhone(phone: string): string {
    if (!phone) return '';
    const digits = phone.replace(/[^0-9]/g, '');
    if (digits.length >= 10) {
      const last4 = digits.substring(digits.length - 4);
      return `+91 ******${last4}`;
    }
    return phone;
  }

  async sendForgotPasswordOtp(identifier: string) {
    const cleanId = (identifier || '').trim();
    const user = await this.usersService.findByEmailOrPhone(cleanId);
    if (!user) {
      throw new NotFoundException('No account found with this email or phone number.');
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    user.resetToken = null;
    user.resetTokenExpires = null;
    await user.save();

    this.logger.log(`[PASSWORD RESET OTP] Generated for user ${user.email} (${user.phone}): ${otp}`);

    // Fetch SMTP settings from env OR database settings
    let emailSent = false;
    const smtpHost = process.env.SMTP_HOST || (await this.settingsService.getSetting('smtp_host'));
    const smtpUser = process.env.SMTP_USER || (await this.settingsService.getSetting('smtp_user'));
    const smtpPass = process.env.SMTP_PASS || (await this.settingsService.getSetting('smtp_pass'));
    const smtpPort = Number(process.env.SMTP_PORT || (await this.settingsService.getSetting('smtp_port'))) || 587;
    const smtpFrom = process.env.SMTP_FROM || (await this.settingsService.getSetting('smtp_from')) || smtpUser;

    if (smtpHost && smtpUser && smtpPass && user.email) {
      try {
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
        });

        await transporter.sendMail({
          from: `"Foody Bhai" <${smtpFrom}>`,
          to: user.email,
          subject: 'Your Foody Bhai Password Reset Code',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background: #ffffff;">
              <h2 style="color: #ea580c; text-align: center; margin-bottom: 8px;">Foody Bhai</h2>
              <p style="color: #475569; font-size: 15px; line-height: 1.5;">Hi <strong>${user.name}</strong>,</p>
              <p style="color: #475569; font-size: 14px; line-height: 1.5;">You requested to reset your account password. Use the verification code below to verify your identity:</p>
              <div style="text-align: center; margin: 25px 0;">
                <span style="display: inline-block; font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #1e293b; background: #f8fafc; padding: 12px 28px; border-radius: 10px; border: 2px dashed #cbd5e1;">${otp}</span>
              </div>
              <p style="color: #64748b; font-size: 13px;">This code is valid for <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
              <p style="color: #94a3b8; font-size: 12px; text-align: center;">Foody Bhai - Fresh & Authentic Taste | Meerut, India</p>
            </div>
          `,
        });
        emailSent = true;
        this.logger.log(`Password reset email successfully sent to ${user.email}`);
      } catch (err) {
        this.logger.error('Failed to send password reset email via SMTP:', err);
      }
    } else {
      this.logger.warn(`SMTP settings not configured. Cannot send email to ${user.email}. Set SMTP_HOST, SMTP_USER, SMTP_PASS in backend/.env or Admin Settings.`);
    }

    // Fetch SMS settings from env OR database settings
    let smsSent = false;
    const fast2smsKey = process.env.FAST2SMS_API_KEY || (await this.settingsService.getSetting('fast2sms_api_key'));
    if (fast2smsKey && user.phone) {
      try {
        const cleanPhone = this.usersService.cleanPhone(user.phone);
        if (cleanPhone && cleanPhone.length === 10) {
          const axios = require('axios');
          await axios.post(
            'https://www.fast2sms.com/dev/bulkV2',
            {
              route: 'otp',
              variables_values: otp,
              numbers: cleanPhone,
            },
            {
              headers: { authorization: fast2smsKey },
            },
          );
          smsSent = true;
          this.logger.log(`Password reset SMS sent to ${cleanPhone}`);
        }
      } catch (err) {
        this.logger.error('Failed to send SMS via Fast2SMS:', err);
      }
    }

    const maskedEmail = this.maskEmail(user.email);
    const maskedPhone = this.maskPhone(user.phone);

    return {
      success: true,
      message: `A 6-digit verification code has been sent${maskedEmail ? ` to ${maskedEmail}` : ''}${maskedPhone ? ` and ${maskedPhone}` : ''}.`,
      maskedEmail,
      maskedPhone,
    };
  }

  async verifyForgotPasswordOtp(identifier: string, otp: string) {
    if (!otp || !otp.trim()) {
      throw new BadRequestException('Please enter the 6-digit OTP verification code.');
    }

    const cleanId = (identifier || '').trim();
    const user = await this.usersService.findByEmailOrPhone(cleanId);
    if (!user) {
      throw new NotFoundException('Account not found with this email or phone number.');
    }

    if (!user.resetOtp || !user.resetOtpExpires) {
      throw new BadRequestException('No password reset was requested for this account, or the OTP has expired. Please request a new code.');
    }

    if (new Date() > new Date(user.resetOtpExpires)) {
      throw new BadRequestException('OTP code has expired. Please request a new code.');
    }

    if (user.resetOtp.trim() !== otp.trim()) {
      throw new BadRequestException('Invalid OTP code. Please check the code and try again.');
    }

    // Generate secure reset token valid for 15 minutes
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpires = new Date(Date.now() + 15 * 60 * 1000);
    user.resetOtp = null; // consume OTP so it cannot be reused
    user.resetOtpExpires = null;
    await user.save();

    this.logger.log(`OTP verified successfully for user: ${user.email}`);

    return {
      success: true,
      message: 'OTP verified successfully! You can now set your new password.',
      resetToken,
    };
  }

  async resetPasswordWithToken(identifier: string, resetToken: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6) {
      throw new BadRequestException('New password must be at least 6 characters long.');
    }
    if (!resetToken || !resetToken.trim()) {
      throw new BadRequestException('Reset token is missing. Please verify your OTP code again.');
    }

    const cleanId = (identifier || '').trim();
    const user = await this.usersService.findByEmailOrPhone(cleanId);
    if (!user) {
      throw new NotFoundException('Account not found with this email or phone number.');
    }

    if (!user.resetToken || !user.resetTokenExpires) {
      throw new BadRequestException('Password reset session has expired. Please request a new OTP code.');
    }

    if (new Date() > new Date(user.resetTokenExpires)) {
      throw new BadRequestException('Password reset session has expired. Please request a new OTP code.');
    }

    if (user.resetToken !== resetToken.trim()) {
      throw new BadRequestException('Invalid reset session token. Please verify your OTP code again.');
    }

    const updated = await this.usersService.setPassword(user._id.toString(), newPassword);
    if (!updated) {
      throw new BadRequestException('Failed to update password. Please try again.');
    }

    user.resetToken = null;
    user.resetTokenExpires = null;
    user.needsPasswordSet = false;
    await user.save();

    const payload: JwtPayload = {
      sub: user._id.toString(),
      email: user.email,
      role: user.role || 'user',
    };
    const accessToken = this.jwtService.sign(payload);

    this.logger.log(`Password successfully reset for user: ${user.email}`);

    return {
      success: true,
      message: 'Password reset successfully! You are now logged in.',
      accessToken,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        needsPasswordSet: false,
      },
    };
  }
}
