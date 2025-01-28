import { Module } from '@nestjs/common';
import { IncomeService } from './incomes.service';
import { IncomeController } from './incomes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Income } from './entities/income.entity';

@Module({
  controllers: [IncomeController],
  providers: [IncomeService],
  imports: [TypeOrmModule.forFeature([Income])],
  exports: [TypeOrmModule, IncomeService],
})
export class IncomeModule {}
