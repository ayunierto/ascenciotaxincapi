import { Controller, Post, Body } from '@nestjs/common';
import { AwsService } from './aws.service';
import { Auth } from 'src/auth/decorators';
import { AnalyzeExpenseDto } from './dto/analyze-expense.dto';

@Controller('aws')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('analyze-expense')
  @Auth()
  analyzeExpense(@Body() analyzeExpenseDto: AnalyzeExpenseDto) {
    return this.awsService.analyzeExpense(analyzeExpenseDto);
  }
}
