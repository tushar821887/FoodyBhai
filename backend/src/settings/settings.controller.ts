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
