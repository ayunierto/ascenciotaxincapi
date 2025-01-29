import { Module } from '@nestjs/common';
import { AccountsTypesService } from './accounts-types.service';
import { AccountsTypesController } from './accounts-types.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountType } from './entities/account-type.entity';

@Module({
  controllers: [AccountsTypesController],
  providers: [AccountsTypesService],
  imports: [TypeOrmModule.forFeature([AccountType])],
  exports: [TypeOrmModule, AccountsTypesService],
})
export class AccountsTypesModule {}
