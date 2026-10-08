import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Setting, SettingDocument } from './schemas/setting.schema';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting.name) private settingModel: Model<SettingDocument>) {}

  async getSetting(key: string): Promise<any> {
    const setting = await this.settingModel.findOne({ key }).exec();
    return setting ? setting.value : null;
  }

  async setSetting(key: string, value: any): Promise<void> {
    await this.settingModel.findOneAndUpdate(
      { key },
      { value },
      { upsert: true, new: true }
    ).exec();
  }

  async getAllSettings(): Promise<any> {
    const settings = await this.settingModel.find().exec();
    const result: Record<string, any> = {};
    settings.forEach(s => result[s.key] = s.value);
    return result;
  }
}
