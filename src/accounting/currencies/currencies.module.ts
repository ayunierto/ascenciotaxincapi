import { Module } from '@nestjs/common';
import { CurrencyService } from './currencies.service';
import { CurrencyController } from './currencies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService],
  imports: [TypeOrmModule.forFeature([Currency]), AuthModule],
  exports: [TypeOrmModule, CurrencyService],
})
export class CurrencyModule {}
