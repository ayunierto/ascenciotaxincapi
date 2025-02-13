import { Module } from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { ExpenseController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import { Category } from '../categories/entities/category.entity';
import { Account } from '../accounts/entities/account.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [
    TypeOrmModule.forFeature([Expense, Subcategory, Category, Account]),
    AuthModule,
  ],
  exports: [TypeOrmModule, ExpenseService],
})
export class ExpenseModule {}
