import { forwardRef, Module } from '@nestjs/common';
import { CurrencyService } from './currencies.service';
import { CurrencyController } from './currencies.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Currency } from './entities/currency.entity';
import { AccountModule } from '../accounts/accounts.module';

@Module({
  controllers: [CurrencyController],
  providers: [CurrencyService],
  imports: [
    TypeOrmModule.forFeature([Currency]),
    forwardRef(() => AccountModule),
  ],
  exports: [TypeOrmModule, CurrencyService],
})
export class CurrencyModule {}
