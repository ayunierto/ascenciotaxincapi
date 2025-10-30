import { Module } from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { ExpenseController } from './expenses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Expense } from './entities/expense.entity';
import { AuthModule } from 'src/auth/auth.module';
import { LogsModule } from 'src/logs/logs.module';
import { CategoriesModule } from '../categories/categories.module';
import { SubcategoriesModule } from '../subcategories/subcategories.module';
import { FilesModule } from 'src/files/files.module';
import { OcrModule } from 'src/ocr/ocr.module';
import { OpenaiModule } from 'src/openai/openai.module';

@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
  imports: [
    TypeOrmModule.forFeature([Expense]),
    AuthModule,
    LogsModule,
    CategoriesModule,
    SubcategoriesModule,
    FilesModule,
    OcrModule,
    OpenaiModule,
  ],
  exports: [ExpenseService],
})
export class ExpenseModule {}
