import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';
import { AppPlatform, AppVersion } from './entities/app-version.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppVersionsService {
  constructor(
    @InjectRepository(AppVersion)
    private repo: Repository<AppVersion>,
  ) {}

  async create(dto: CreateAppVersionDto) {
    const activeVersion = await this.repo.findOne({
      where: { platform: dto.platform },
    });

    if (activeVersion) {
      // Only 1 active version per platform → is updated
      Object.assign(activeVersion, dto);
      return this.repo.save(activeVersion);
    }

    const version = this.repo.create(dto);
    return this.repo.save(version);
  }

  async getForPlatform(platform: AppPlatform) {
    const version = await this.repo.findOne({
      where: [{ platform }, { platform: AppPlatform.ALL }],
      order: { updatedAt: 'DESC' },
    });

    if (!version) throw new NotFoundException('No version config found');
    return version;
  }

  async update(id: number, dto: UpdateAppVersionDto) {
    const version = await this.repo.findOne({ where: { id } });
    if (!version) throw new NotFoundException('Version not found');

    Object.assign(version, dto);
    return this.repo.save(version);
  }

  async findAll() {
    return this.repo.find();
  }
}
