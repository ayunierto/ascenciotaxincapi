import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
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
import {
  CreateSubcategoryResponse,
  DeleteSubcategoryResponse,
  GetSubcategoriesResponse,
  GetSubcategoryResponse,
  UpdateSubcategoryResponse,
} from './interfaces';

@Injectable()
export class SubcategoryService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async create(
    createSubcategoryDto: CreateSubcategoryDto,
    user: User,
  ): Promise<CreateSubcategoryResponse> {
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
        throw new BadRequestException('Category not found');
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
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating subcategory. Please try again later.',
        'CREATE_SUBCATEGORY_FAILED',
      );
    }
  }

  async findAll(): Promise<GetSubcategoriesResponse> {
    try {
      const subcategories = await this.subcategoryRepository.find({
        relations: {
          category: true,
        },
      });
      return subcategories;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error fetching subcategories',
        error.message,
      );
    }
  }

  async findOne(id: string): Promise<GetSubcategoryResponse> {
    try {
      const subcategory = await this.subcategoryRepository.findOneBy({ id });
      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }
      return subcategory;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error fetching subcategory',
        error.message,
      );
    }
  }

  async update(
    id: string,
    updateSubcategoryDto: UpdateSubcategoryDto,
    user: User,
  ): Promise<UpdateSubcategoryResponse> {
    try {
      const isAdmin = user.roles.includes(Role.Admin);
      if (updateSubcategoryDto.isSystem && !isAdmin) {
        throw new UnauthorizedException(
          'Only admins can update system subcategories',
        );
      }
      const subcategory = await this.subcategoryRepository.findOneBy({ id });
      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }

      const updatedSubcategory = this.subcategoryRepository.merge(
        subcategory,
        updateSubcategoryDto,
      );

      await this.subcategoryRepository.save(updatedSubcategory);
      return updatedSubcategory;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Error updating subcategory',
        error.message,
      );
    }
  }

  async remove(id: string, user: User): Promise<DeleteSubcategoryResponse> {
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
      throw new InternalServerErrorException(
        'Error deleting subcategory',
        error.message,
      );
    }
  }
}
