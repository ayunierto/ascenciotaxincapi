import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ExpenseService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { AnalyzeExpenseDto } from './dto/analyze-expense.dto';
import { AwsService } from 'src/aws/aws.service';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('expenses')
export class ExpenseController {
  constructor(
    private readonly expenseService: ExpenseService,
    private readonly awsService: AwsService,
  ) {}

  @Post()
  @Auth()
  create(@Body() createExpenseDto: CreateExpenseDto, @GetUser() user: User) {
    return this.expenseService.create(createExpenseDto, user);
  }

  @Get()
  @Auth()
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.expenseService.findAll(paginationDto, user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string, @GetUser() user: User) {
    return this.expenseService.findOne(id, user);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @GetUser() user: User,
  ) {
    return this.expenseService.update(id, updateExpenseDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.expenseService.remove(id, user);
  }

  @Post('analyze-expense')
  @Auth()
  analyzeExpense(@Body() analyzeExpenseDto: AnalyzeExpenseDto) {
    return this.awsService.analyzeExpense(analyzeExpenseDto);
  }
}
