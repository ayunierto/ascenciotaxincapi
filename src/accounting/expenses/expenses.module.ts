import { Module } from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { ExpenseController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';
import { AwsModule } from 'src/aws/aws.module';
import { CategoriesModule } from '../categories/categories.module';
import { SubcategoriesModule } from '../subcategories/subcategories.module';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [
    TypeOrmModule.forFeature([Expense]),
    AuthModule,
    LogsModule,
    AwsModule,
    CategoriesModule,
    SubcategoriesModule,
  ],
  exports: [ExpenseService],
})
export class ExpenseModule {}
