import { forwardRef, Module } from '@nestjs/common';
import { AccountsTypesService } from './accounts-types.service';
import { AccountsTypesController } from './accounts-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountType } from './entities/account-type.entity';
import { AccountModule } from '../accounts/accounts.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AccountsTypesController],
  providers: [AccountsTypesService],
  imports: [
    TypeOrmModule.forFeature([AccountType]),
    forwardRef(() => AccountModule),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, AccountsTypesService],
})
export class AccountsTypesModule {}
