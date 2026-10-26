import { Controller, Get, Put, Post, Body, Param, UseGuards, UseInterceptors, UploadedFile, BadRequestException, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import * as fs from 'fs';
import * as path from 'path';

@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  getAllSettings() {
    return this.settingsService.getAllSettings();
  }

  @Get('app/latest')
  async getLatestAppInfo() {
    const version = await this.settingsService.getSetting('app_version');
    const downloadUrl = await this.settingsService.getSetting('app_download_url');
    const releaseNotes = await this.settingsService.getSetting('app_release_notes');
    return {
      version: version || '1.0.0',
      downloadUrl: downloadUrl || '/downloads/foodybhai.apk',
      releaseNotes: releaseNotes || 'Real-time order alerts, smoother performance, and instant order tracking.'
    };
  }

  @Get('app/download')
  downloadApkDirect(@Res() res: any) {
    const candidates = [
      path.resolve(__dirname, '../../../frontend/public/downloads/foodybhai.apk'),
      path.resolve(__dirname, '../../../frontend/dist/foody-bhai/browser/downloads/foodybhai.apk'),
      path.resolve(__dirname, '../../../../frontend/public/downloads/foodybhai.apk'),
      path.resolve(__dirname, '../../../../frontend/dist/foody-bhai/browser/downloads/foodybhai.apk'),
      path.resolve(process.cwd(), 'uploads/foodybhai.apk'),
      path.resolve(process.cwd(), '../frontend/public/downloads/foodybhai.apk'),
      path.resolve(process.cwd(), '../frontend/dist/foody-bhai/browser/downloads/foodybhai.apk'),
    ];

    for (const p of candidates) {
      if (fs.existsSync(p) && fs.statSync(p).size > 100000) {
        res.setHeader('Content-Type', 'application/vnd.android.package-archive');
        res.setHeader('Content-Disposition', 'attachment; filename="FoodyBhai.apk"');
        return fs.createReadStream(p).pipe(res);
      }
    }
    return res.status(404).json({ error: 'APK file not found on server' });
  }

  @UseGuards(JwtAuthGuard)
  @Post('app/upload-apk')
  @UseInterceptors(FileInterceptor('apk'))
  async uploadApk(@UploadedFile() file: any, @Body() body: any) {
    if (!file) {
      throw new BadRequestException('No APK file provided.');
    }

    const destinations = [
      path.resolve(__dirname, '../../../frontend/public/downloads/foodybhai.apk'),
      path.resolve(__dirname, '../../../frontend/dist/foody-bhai/browser/downloads/foodybhai.apk'),
      path.resolve(__dirname, '../../../../frontend/public/downloads/foodybhai.apk'),
      path.resolve(__dirname, '../../../../frontend/dist/foody-bhai/browser/downloads/foodybhai.apk'),
      path.resolve(process.cwd(), 'uploads/foodybhai.apk'),
      path.resolve(process.cwd(), '../frontend/public/downloads/foodybhai.apk'),
      path.resolve(process.cwd(), '../frontend/dist/foody-bhai/browser/downloads/foodybhai.apk'),
    ];

    for (const dest of destinations) {
      try {
        const dir = path.dirname(dest);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(dest, file.buffer);
      } catch (e) {}
    }

    if (body && body.version) {
      await this.settingsService.setSetting('app_version', body.version);
    }
    if (body && body.releaseNotes) {
      await this.settingsService.setSetting('app_release_notes', body.releaseNotes);
    }
    await this.settingsService.setSetting('app_download_url', '/downloads/foodybhai.apk');

    const sizeMb = (file.size / (1024 * 1024)).toFixed(2);
    return {
      success: true,
      message: `APK uploaded successfully (${sizeMb} MB)!`,
      size: file.size,
      downloadUrl: '/downloads/foodybhai.apk'
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post('test-smtp')
  async testSmtpConnection(@Body() body: any) {
    const smtpHost = body?.smtpHost || process.env.SMTP_HOST || (await this.settingsService.getSetting('smtp_host'));
    const smtpPort = Number(body?.smtpPort || process.env.SMTP_PORT || (await this.settingsService.getSetting('smtp_port'))) || 465;
    const smtpUser = body?.smtpUser || process.env.SMTP_USER || (await this.settingsService.getSetting('smtp_user'));
    const smtpPass = body?.smtpPass || process.env.SMTP_PASS || (await this.settingsService.getSetting('smtp_pass'));
    let smtpFrom = body?.smtpFrom || process.env.SMTP_FROM || (await this.settingsService.getSetting('smtp_from'));
    const targetEmail = body?.targetEmail || smtpUser;

    if (!smtpHost || !smtpUser || !smtpPass) {
      throw new BadRequestException('SMTP Host, Username, and Password are all required.');
    }

    if (!smtpFrom || !smtpFrom.includes(smtpUser)) {
      smtpFrom = `"Foody Bhai" <${smtpUser}>`;
    }

    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    try {
      await transporter.verify();
      const info = await transporter.sendMail({
        from: smtpFrom,
        to: targetEmail,
        subject: '🧪 Foody Bhai - SMTP Connection Verified Successfully!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; border: 1px solid #10b981; border-radius: 12px; background: #ffffff;">
            <h2 style="color: #059669; margin: 0 0 10px 0;">✅ SMTP Connected Successfully!</h2>
            <p style="color: #334155; font-size: 14px; line-height: 1.5;">
              Congratulations! Your Hostinger / SMTP email server is working properly.
            </p>
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 12px; margin: 15px 0; font-size: 13px; color: #166534;">
              <strong>Host:</strong> ${smtpHost}:${smtpPort}<br>
              <strong>User:</strong> ${smtpUser}<br>
              <strong>Sender:</strong> ${smtpFrom}<br>
              <strong>Delivered to:</strong> ${targetEmail}
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 0;">
              Timestamp: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}
            </p>
          </div>
        `,
      });

      return {
        success: true,
        message: `SMTP verified! Test email successfully delivered to ${targetEmail}`,
        messageId: info.messageId,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Failed to authenticate or send email through SMTP',
      };
    }
  }

  @Get(':key')
  async getSetting(@Param('key') key: string) {
    const value = await this.settingsService.getSetting(key);
    return { value };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':key')
  setSetting(@Param('key') key: string, @Body() body: any) {
    return this.settingsService.setSetting(key, body.value);
  }
}
