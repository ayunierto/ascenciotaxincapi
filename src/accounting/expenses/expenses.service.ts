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
import { Expense } from './entities/expense.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { LogsService } from 'src/logs/logs.service';
import { ExpensesByCategory } from './interfaces/expenses-by-category.interface';

import { CategoriesService } from '../categories/categories.service';
import { SubcategoriesService } from '../subcategories/subcategories.service';
import { FilesService } from 'src/files/files.service';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private readonly expenseRepository: Repository<Expense>,
    private readonly logService: LogsService,
    private readonly categoriesService: CategoriesService,
    private readonly subcategoriesService: SubcategoriesService,
    private readonly filesService: FilesService,
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

      const expensesByCategory: ExpensesByCategory = {};

      expenses.forEach((expense) => {
        const categoryName = expense.category.name;
        const subcategoryName =
          expense.subcategory?.name || 'Without subcategory';

        if (!expensesByCategory[categoryName]) {
          expensesByCategory[categoryName] = {
            total: { gross: 0, hst: 0, net: 0 },
          };
        }

        if (!expensesByCategory[categoryName][subcategoryName]) {
          expensesByCategory[categoryName][subcategoryName] = {
            gross: 0,
            hst: 0,
            net: 0,
          };
        }

        expensesByCategory[categoryName][subcategoryName].gross += Number(
          expense.total,
        );

        expensesByCategory[categoryName].total.gross += Number(expense.total);
      });

      return {
        expensesByCategory,
      };
    } catch (error) {
      throw error;
    }
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    user: User,
  ): Promise<Expense> {
    try {
      const { categoryId, subcategoryId, date, imageUrl, ...rest } =
        createExpenseDto;

      const oldPath = this.extractPublicId(imageUrl);
      // const oldPath = `ascencio_tax_inc/temp_receipts/${user.id}/${publicId}`;
      // const newPath = `ascencio_tax_inc/receipts/${user.id}/${publicId}`;
      const newPath = oldPath.replace('temp_receipts', 'receipts');
      const updatedImageUrl = imageUrl.replace(oldPath, newPath);

      await this.filesService.move(oldPath, newPath);

      // Validate if the category provided exists
      const category = await this.categoriesService.findOne(categoryId);

      // Validate if the subcategory provided exists
      let subcategory = null;
      if (subcategoryId) {
        subcategory = await this.subcategoriesService.findOne(subcategoryId);
      }

      const newExpense = this.expenseRepository.create({
        category: category,
        date: new Date(date),
        subcategory: subcategory,
        user: user,
        imageUrl: updatedImageUrl,
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
        error.message || 'Error creating expense. Please try again later.',
      );
    }
  }

  async findAll(paginationDto: PaginationDto, user: User): Promise<Expense[]> {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const expenses = await this.expenseRepository.find({
        take: limit,
        skip: offset,
        where: { user: { id: user.id } },
        relations: { category: true, subcategory: true },
        order: {
          createdAt: 'DESC',
        },
      });
      return expenses;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error fetching expenses. Please try again later.',
      );
    }
  }

  async findOne(id: string, user: User): Promise<Expense> {
    try {
      const expense = await this.expenseRepository.findOne({
        where: { id: id, user: { id: user.id } },
        relations: { category: true, subcategory: true },
      });
      return expense;
    } catch (error) {
      throw new BadRequestException(
        error.message || 'Error fetching expense. Please try again later.',
      );
    }
  }

  async update(
    id: string,
    updateExpenseDto: UpdateExpenseDto,
    user: User,
  ): Promise<Expense> {
    try {
      const { categoryId, subcategoryId, date, ...rest } = updateExpenseDto;

      const expense = await this.expenseRepository.findOne({
        where: { id: id, user: { id: user.id } },
      });
      if (!expense) {
        throw new BadRequestException('Expense not found');
      }

      let category = null;
      if (categoryId) {
        category = await this.categoriesService.findOne(categoryId);
      } else {
        category = expense.category;
      }

      let subcategory = null;
      if (subcategoryId) {
        subcategory = await this.subcategoriesService.findOne(subcategoryId);
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
        category: category,
        subcategory: subcategory,
        user: user,
      });

      await this.expenseRepository.save(updatedExpense);

      await this.logService.create(
        { description: `Expense updated: ${updatedExpense.merchant}` },
        user,
      );

      return updatedExpense;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating expense. Please try again later.',
      );
    }
  }

  async remove(id: string, user: User): Promise<Expense> {
    try {
      const expense = await this.expenseRepository.findOne({
        where: { id: id, user: { id: user.id } },
      });
      if (!expense) {
        throw new BadRequestException('Expense not found');
      }
      // TODO: delete temp file
      await this.expenseRepository.remove(expense);

      await this.logService.create(
        { description: `Expense deleted: ${expense.merchant}` },
        user,
      );

      return expense;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error deleting expense. Please try again later.',
      );
    }
  }

  extractPublicId(url: string): string | null {
    try {
      // Example:
      // https://res.cloudinary.com/demo/image/upload/v1720001234/ascencio_tax_inc/temp_receipts/42/receipt_abc123.jpg
      const parts = url.split('/upload/');
      const path = parts[1].split('.')[0]; // ascencio_tax_inc/temp_receipts/42/receipt_abc123
      // Delete prefix of version v1720001234/
      return path.replace(/^v\d+\//, '');
    } catch {
      return null;
    }
  }
}
