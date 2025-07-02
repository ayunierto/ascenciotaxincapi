import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Between } from 'typeorm';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../accounts/entities/account.entity';
import { Expense } from './entities/expense.entity';
import { Category } from '../categories/entities/category.entity';
import { Subcategory } from '../subcategories/entities/subcategory.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LogsService } from 'src/logs/logs.service';
import { ExpensesByCategory } from './interfaces/expenses-by-category.interface';
import {
  CreateExpenseResponse,
  DeleteExpenseResponse,
  GetExpenseResponse,
  GetExpensesResponse,
  UpdateExpenseResponse,
} from './interfaces/expenses.interface';
import { DateTime } from 'luxon';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,

    private readonly logService: LogsService,
  ) {}

  async findAllByDateRange(startDate: Date, endDate: Date, user: User) {
    try {
      const expenses = await this.expenseRepository.find({
        where: {
          user: { id: user.id },
          date: Between(startDate, endDate),
        },
        relations: ['category', 'subcategory'],
      });

      console.warn({ expenses });

      // Crear objeto para almacenar gastos por categoría
      const expensesByCategory: ExpensesByCategory = {};

      // Procesar cada gasto
      expenses.forEach((expense) => {
        const categoryName = expense.category.name;
        const subcategoryName =
          expense.subcategory?.name || 'Without subcategory';

        // Inicializar categoría si no existe
        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = {
            total: { gross: 0, hst: 0, net: 0 },
          };
        }

        // Inicializar subcategoría si no existe
        if (!expensesByCategory[categoryName][subcategoryName]) {
          expensesByCategory[categoryName][subcategoryName] = {
            gross: 0,
            hst: 0,
            net: 0,
          };
        }

        // Calcular montos
        // const hst: number = Number(expense.tax);
        // const net: number = Number(expense.total) + hst;

        // Acumular valores
        expensesByCategory[categoryName][subcategoryName].gross += Number(
          expense.total,
        );
        // expensesByCategory[categoryName][subcategoryName].hst += Number(hst);
        // expensesByCategory[categoryName][subcategoryName].net += Number(net);

        // Acumular totales por categoría
        expensesByCategory[categoryName].total.gross += Number(expense.total);
        // expensesByCategory[categoryName].total.hst += hst;
        // expensesByCategory[categoryName].total.net += net;
      });

      return {
        expensesByCategory,
      };
    } catch (error) {
      console.error('Error in findAllByDateRange:', error);
      throw error;
    }
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    user: User,
  ): Promise<CreateExpenseResponse> {
    try {
      const { accountId, categoryId, subcategoryId, date, ...rest } =
        createExpenseDto;

      // Validate if the account provided exists for the user
      const account = await this.accountRepository.findOne({
        where: { id: accountId, user: { id: user.id } },
        relations: ['currency', 'accountType'],
      });
      if (!account)
        throw new BadRequestException(
          `Account with id ${accountId} for ${user.firstName} user not found`,
        );

      // Validate if the category provided exists
      const category = await this.categoryRepository.findOneBy({
        id: categoryId,
      });
      if (!category)
        throw new BadRequestException(
          `Category with id ${categoryId} not found`,
        );

      // Validate if the subcategory provided exists
      let subcategory = null;
      if (subcategoryId) {
        subcategory = await this.subcategoryRepository.findOneBy({
          id: subcategoryId,
        });
        if (!subcategory)
          throw new BadRequestException(
            `Subcategory with id ${subcategoryId} not found`,
          );
      }

      const newExpense = this.expenseRepository.create({
        account: account,
        category: category,
        date: new Date(date),
        subcategory: subcategory,
        user: user,
        ...rest,
      });

      await this.expenseRepository.save(newExpense);

      await this.logService.create(
        { description: `Expense added: ${category.name}` },
        user,
      );

      return newExpense;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error creating expense. Please try again later.',
        'Internal Server Error',
      );
    }
  }

  async findAll(
    paginationDto: PaginationDto,
    user: User,
  ): Promise<GetExpensesResponse> {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const expenses = await this.expenseRepository.find({
        take: limit,
        skip: offset,
        where: { user: { id: user.id } },
        relations: ['account', 'category', 'subcategory'],
        order: {
          createdAt: 'ASC',
        },
      });
      return expenses;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error fetching expenses. Please try again later.',
        'Internal Server Error',
      );
    }
  }

  async findOne(id: string, user: User): Promise<GetExpenseResponse> {
    try {
      const expense = await this.expenseRepository.findOne({
        where: { id: id, user: { id: user.id } },
      });
      if (!expense) {
        throw new BadRequestException('Expense not found');
      }
      return expense;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error fetching expense. Please try again later.',
        'Internal Server Error',
      );
    }
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    user: User,
  ): Promise<UpdateExpenseResponse> {
    try {
      const { accountId, categoryId, subcategoryId, date, ...rest } =
        updateExpenseDto;

      const expense = await this.expenseRepository.findOne({
        where: { id: id, user: { id: user.id } },
      });
      if (!expense) {
        throw new BadRequestException('Expense not found');
      }

      let account = null;
      if (accountId) {
        account = await this.accountRepository.findOne({
          where: { id: accountId, user: { id: user.id } },
          relations: ['currency', 'accountType'],
        });
        if (!account) {
          throw new BadRequestException(
            `Account with id ${accountId} not found`,
          );
        }
      } else {
        account = expense.account;
      }

      let category = null;
      if (categoryId) {
        category = await this.categoryRepository.findOne({
          where: { id: categoryId },
        });
        if (!category) {
          throw new BadRequestException(
            `Category with id ${categoryId} not found`,
          );
        }
      } else {
        category = expense.category;
      }

      let subcategory = null;
      if (subcategoryId) {
        subcategory = await this.subcategoryRepository.findOne({
          where: { id: subcategoryId },
        });
        if (!subcategory) {
          throw new BadRequestException('Subcategory not found');
        }
      } else {
        subcategory = expense.subcategory;
      }

      const updatedExpense = await this.expenseRepository.preload({
        id,
        ...rest,
        date: new Date(date),
        account: account,
        category: category,
        subcategory: subcategory,
        user: user,
      });

      updatedExpense.updateAt = DateTime.utc().toJSDate();

      await this.expenseRepository.save(updatedExpense);

      await this.logService.create(
        { description: `Expense updated: ${updatedExpense.merchant}` },
        user,
      );

      return updatedExpense;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error updating expense. Please try again later.',
        'Internal Server Error',
      );
    }
  }

  async remove(id: string, user: User): Promise<DeleteExpenseResponse> {
    try {
      const expense = await this.expenseRepository.findOne({
        where: { id: id, user: { id: user.id } },
      });
      if (!expense) {
        throw new BadRequestException('Expense not found');
      }
      await this.expenseRepository.remove(expense);

      await this.logService.create(
        { description: `Expense deleted: ${expense.merchant}` },
        user,
      );

      return expense;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error deleting expense. Please try again later.',
        'Internal Server Error',
      );
    }
  }
}
