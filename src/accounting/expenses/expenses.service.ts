import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
  ) {}

  async create(createExpenseDto: CreateExpenseDto, user: User) {
    try {
      const { accountId, categoryId, subcategoryId, tagsIds, date, ...rest } =
        createExpenseDto;

      const account = await this.accountRepository.findOne({
        where: { id: accountId, user: { id: user.id } },
        relations: ['currency', 'accountType'],
      });
      if (!account)
        throw new NotFoundException(
          `Account with id ${accountId} for ${user.name} user not found`,
        );

      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category)
        throw new NotFoundException(`Category with id ${categoryId} not found`);

      let subcategory = null;
      if (subcategoryId) {
        subcategory = await this.subcategoryRepository.findOne({
          where: { id: subcategoryId },
        });
        if (!subcategory)
          throw new NotFoundException(
            `Subcategory with id ${subcategoryId} not found`,
          );
      }

      const newExpense = this.expenseRepository.create({
        account: account,
        category: category,
        date: new Date(date),
        subcategory: subcategory,
        tags: [],
        user: user,
        ...rest,
      });

      await this.expenseRepository.save(newExpense);
      return newExpense;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const expenses = await this.expenseRepository.find({
        take: limit,
        skip: offset,
        where: { user: { id: user.id } },
        relations: ['account', 'category', 'subcategory', 'tags'],
        order: {
          createdAt: 'ASC',
        },
      });
      return expenses;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findOne(id: number, user: User) {
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
      return error;
    }
  }

  async update(id: number, updateExpenseDto: UpdateExpenseDto, user: User) {
    try {
      const { accountId, categoryId, subcategoryId, tagsIds, date, ...rest } =
        updateExpenseDto;

      const currentExpense = await this.expenseRepository.findOne({
        where: { id: id, user: { id: user.id } },
      });
      if (!currentExpense) {
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
        account = currentExpense.account;
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
        category = currentExpense.category;
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
        subcategory = currentExpense.subcategory;
      }

      const updatedExpense = await this.expenseRepository.preload({
        id,
        ...rest,
        date: new Date(date),
        account: account,
        category: category,
        subcategory: subcategory,
        user: user,
        tags: [],
      });

      updatedExpense.updateAt = new Date();

      await this.expenseRepository.save(updatedExpense);
      return updatedExpense;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async remove(id: number, user: User) {
    try {
      const expense = await this.expenseRepository.findOne({
        where: { id: id, user: user },
      });
      if (!expense) {
        throw new BadRequestException('Expense not found');
      }
      await this.expenseRepository.remove(expense);
      return expense;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
