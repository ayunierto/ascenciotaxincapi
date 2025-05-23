import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Report } from './entities/report.entity';
import { AuthModule } from 'src/auth/auth.module';
import { PrinterModule } from 'src/printer/printer.module';
import { ExpenseModule } from '../expenses/expenses.module';

@Module({
  controllers: [ReportsController],
  providers: [ReportsService],
  imports: [
    TypeOrmModule.forFeature([Report]),
    AuthModule,
    PrinterModule,
    ExpenseModule,
  ],
})
export class ReportsModule {}
