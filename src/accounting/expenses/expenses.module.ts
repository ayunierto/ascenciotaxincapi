import { Module } from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { ExpenseController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [TypeOrmModule.forFeature([Expense])],
  exports: [TypeOrmModule, ExpenseService],
})
export class ExpenseModule {}
