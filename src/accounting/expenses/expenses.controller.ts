import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AnalyzeExpenseDto } from './dto/analyze-expense.dto';
import { AwsService } from 'src/aws/aws.service';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('expense')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly awsService: AwsService,
  ) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createExpenseDto: CreateExpenseDto, @Request() req) {
    return this.expenseService.create(createExpenseDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Query() paginationDto: PaginationDto, @Request() req) {
    return this.expenseService.findAll(paginationDto, req.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string, @Request() req) {
    return this.expenseService.findOne(id, req.user);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @Request() req,
  ) {
    return this.expenseService.update(id, updateExpenseDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.expenseService.remove(id, req.user);
  }

  @Post('analyze-expense')
  // @UseGuards(AuthGuard)
  analyzeExpense(@Body() analyzeExpenseDto: AnalyzeExpenseDto) {
    return this.awsService.analyzeExpense(analyzeExpenseDto);
  }
}
