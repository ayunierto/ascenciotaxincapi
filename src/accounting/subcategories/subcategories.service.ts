import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { Repository } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { Role } from 'src/auth/enums/role.enum';

@Injectable()
export class SubcategoryService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(createSubcategoryDto: CreateSubcategoryDto, user: User) {
    try {
      const isAdmin = user.roles.includes(Role.Admin);
      if (createSubcategoryDto.isSystem && !isAdmin) {
        throw new UnauthorizedException(
          'Only admins can create system categories',
        );
      }

      const category = await this.categoryRepository.findOneBy({
        id: createSubcategoryDto.categoryId,
      });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const newSubcategory = this.subcategoryRepository.create({
        name: createSubcategoryDto.name,
        user: user,
        isSystem: createSubcategoryDto.isSystem || false,
        category: category,
      });
      this.subcategoryRepository.save(newSubcategory);
      return newSubcategory;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findAll() {
    try {
      const subcategories = await this.subcategoryRepository.find({
        relations: {
          category: true,
        },
      });
      return subcategories;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findOne(id: string) {
    try {
      const category = await this.subcategoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }
      return category;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async update(
    id: string,
    updateSubcategoryDto: UpdateSubcategoryDto,
    user: User,
  ) {
    try {
      const isAdmin = user.roles.includes(Role.Admin);
      if (updateSubcategoryDto.isSystem && !isAdmin) {
        throw new UnauthorizedException(
          'Only admins can update system subcategories',
        );
      }
      const category = await this.subcategoryRepository.findOneBy({ id });
      if (!category) {
        throw new NotFoundException('Category not found');
      }

      const updatedCategory = Object.assign(category, updateSubcategoryDto);
      updatedCategory.updatedAt = new Date();
      await this.subcategoryRepository.save(updatedCategory);
      return updatedCategory;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async remove(id: string, user: User) {
    try {
      const subcategory = await this.subcategoryRepository.findOneBy({ id });
      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }
      const isAdmin = user.roles.includes(Role.Admin);
      if (!isAdmin) {
        throw new UnauthorizedException(
          'Only admins can delete system subcategories',
        );
      }

      await this.subcategoryRepository.remove(subcategory);
      return subcategory;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
