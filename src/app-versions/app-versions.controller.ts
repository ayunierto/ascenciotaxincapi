import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { AppVersionsService } from './app-versions.service';
import { CreateAppVersionDto } from './dto/create-app-version.dto';
import { UpdateAppVersionDto } from './dto/update-app-version.dto';
import { AppPlatform } from './entities/app-version.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('app/version')
export class AppVersionsController {
  constructor(private readonly appVersionsService: AppVersionsService) {}

  // 📱 Movil client
  @Get()
  getVersion(@Query('platform') platform: AppPlatform = AppPlatform.ALL) {
    return this.appVersionsService.getForPlatform(platform);
  }

  // 👤 Admin panel
  @Post()
  @Auth(Role.Admin)
  create(@Body() dto: CreateAppVersionDto) {
    return this.appVersionsService.create(dto);
  }

  @Put(':id')
  @Auth(Role.Admin)
  update(@Param('id') id: number, @Body() dto: UpdateAppVersionDto) {
    return this.appVersionsService.update(id, dto);
  }

  @Get('/admin/all')
  @Auth(Role.Admin)
  findAll() {
    return this.appVersionsService.findAll();
  }
}
