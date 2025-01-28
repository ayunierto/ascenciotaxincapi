import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ValidRoles } from 'src/auth/interfaces';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto, user: User) {
    try {
      const isAdmin = user.roles.includes(ValidRoles.admin);
      if (createCategoryDto.isSystem && !isAdmin) {
        throw new UnauthorizedException(
          'Only admins can create system categories',
        );
      }
      const newCategory = this.categoryRepository.create({
        name: createCategoryDto.name,
        isSystem: createCategoryDto.isSystem || false,
        user: user,
        description: createCategoryDto.description,
      });
      await this.categoryRepository.save(newCategory);
      return newCategory;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findAll() {
    try {
      const categories = await this.categoryRepository.find();
      return categories;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findOne(id: number) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto, user: User) {
    try {
      const isAdmin = user.roles.includes(ValidRoles.admin);
      if (updateCategoryDto.isSystem && !isAdmin) {
        throw new UnauthorizedException(
          'Only admins can update system categories',
        );
      }
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const updatedCategory = Object.assign(category, updateCategoryDto);
      updatedCategory.updateAt = new Date();
      await this.categoryRepository.save(updatedCategory);
      return updatedCategory;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async remove(id: number, user: User) {
    try {
      const category = await this.categoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      const isAdmin = user.roles.includes(ValidRoles.admin);
      if (!isAdmin) {
        throw new UnauthorizedException(
          'Only admins can delete system categories',
        );
      }

      await this.categoryRepository.remove(category);
      return category;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
