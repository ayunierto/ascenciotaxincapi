import { Module } from '@nestjs/common';
import { AccountService } from './accounts.service';
import { AccountController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Currency } from '../currencies/entities/currency.entity';
import { AccountType } from '../accounts-types/entities/account-type.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AccountController],
  providers: [AccountService],
  imports: [
    TypeOrmModule.forFeature([Account, Currency, AccountType]),
    AuthModule,
  ],
  exports: [TypeOrmModule, AccountService],
})
export class AccountModule {}
