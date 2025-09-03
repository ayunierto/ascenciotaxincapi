import {
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
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
        'CREATE_CATEGORY_FAILED',
      );
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find();
      return categories;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
        'GET_CATEGORIES_FAILED',
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
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
        'GET_CATEGORY_FAILED',
      );
    }
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const updatedCategory = this.categoryRepository.merge(
        category,
        updateCategoryDto,
      );
      await this.categoryRepository.save(updatedCategory);
      return updatedCategory;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
        'GET_CATEGORY_FAILED',
      );
    }
  }

  async remove(id: string) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      await this.categoryRepository.remove(category);
      return category;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating category. Please try again later.',
        'REMOVE_CATEGORY_FAILED',
      );
    }
  }
}
