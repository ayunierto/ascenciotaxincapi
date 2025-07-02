import { forwardRef, Module } from '@nestjs/common';
import { AccountTypesService } from './account-types.service';
import { AccountTypesController } from './account-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountType } from './entities/account-type.entity';
import { AccountModule } from '../accounts/accounts.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [AccountTypesController],
  providers: [AccountTypesService],
  imports: [
    TypeOrmModule.forFeature([AccountType]),
    forwardRef(() => AccountModule),
    forwardRef(() => AuthModule),
  ],
  exports: [TypeOrmModule, AccountTypesService],
})
export class AccountsTypesModule {}
