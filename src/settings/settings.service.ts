import { Injectable } from '@nestjs/common';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Setting } from './entities/setting.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepository: Repository<Setting>,
  ) {}

  async create(createSettingDto: CreateSettingDto): Promise<Setting> {
    const settings = this.settingsRepository.create(createSettingDto);
    return await this.settingsRepository.save(settings);
  }

  async getSettings(): Promise<Setting> {
    return await this.settingsRepository.findOne({ where: { id: 1 } });
  }

  async update(updateSettingDto: UpdateSettingDto) {
    const settings = await this.getSettings();
    const updatedSettings = this.settingsRepository.merge(
      settings,
      updateSettingDto,
    );
    return this.settingsRepository.save(updatedSettings);
  }
}
