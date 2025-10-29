import {
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto) {
    try {
      const newCategory = this.categoryRepository.create({
        name: createCategoryDto.name,
        description: createCategoryDto.description,
      });
      await this.categoryRepository.save(newCategory);
      return newCategory;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while creating category. Please try again later.',
      );
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find({
        relations: {
          subcategories: true,
        },
      });
      return categories;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
      );
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
      );
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.findOne(id);

      const updatedCategory = this.categoryRepository.merge(
        category,
        updateCategoryDto,
      );
      await this.categoryRepository.save(updatedCategory);
      return updatedCategory;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
      );
    }
  }

  async remove(id: string) {
    try {
      const category = await this.findOne(id);

      await this.categoryRepository.remove(category);
      return category;
    } catch (error) {
      if (error instanceof HttpException) throw error;

      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
      );
    }
  }
}
