import { Module } from '@nestjs/common';
import { AppVersionsService } from './app-versions.service';
import { AppVersionsController } from './app-versions.controller';
import { AppVersion } from './entities/app-version.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([AppVersion]), AuthModule],
  controllers: [AppVersionsController],
  providers: [AppVersionsService],
  exports: [AppVersionsService],
})
export class AppVersionsModule {}
