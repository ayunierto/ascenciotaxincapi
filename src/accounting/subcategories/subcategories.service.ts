import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { Repository } from 'typeorm';
import { CategoriesService } from '../categories/categories.service';

@Injectable()
export class SubcategoriesService {
  constructor(
    @InjectRepository(Subcategory)
    private readonly subcategoryRepository: Repository<Subcategory>,

    private readonly categoriesService: CategoriesService,
  ) {}

  async create(
    createSubcategoryDto: CreateSubcategoryDto,
  ): Promise<Subcategory> {
    const { categoryId } = createSubcategoryDto;
    try {
      const category = await this.categoriesService.findOne(categoryId);

      const newSubcategory = this.subcategoryRepository.create({
        name: createSubcategoryDto.name,
        category: category,
      });
      this.subcategoryRepository.save(newSubcategory);
      return newSubcategory;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message ||
          'An unexpected error occurred while creating subcategory. Please try again later.',
      );
    }
  }

  async findAll(): Promise<Subcategory[]> {
    try {
      const subcategories = await this.subcategoryRepository.find({});
      return subcategories;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Error fetching subcategories',
      );
    }
  }

  async findOne(id: string): Promise<Subcategory> {
    try {
      const subcategory = await this.subcategoryRepository.findOneBy({ id });
      if (!subcategory) {
        throw new NotFoundException('Subcategory not found');
      }
      return subcategory;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Error fetching subcategory',
      );
    }
  }

  async update(
    id: string,
    updateSubcategoryDto: UpdateSubcategoryDto,
  ): Promise<Subcategory> {
    try {
      const subcategory = await this.findOne(id);

      const updatedSubcategory = this.subcategoryRepository.merge(
        subcategory,
        updateSubcategoryDto,
      );

      await this.subcategoryRepository.save(updatedSubcategory);
      return updatedSubcategory;
    } catch (error) {
      throw new InternalServerErrorException(
        'Error updating subcategory',
        error.message,
      );
    }
  }

  async remove(id: string): Promise<Subcategory> {
    try {
      const subcategory = await this.findOne(id);

      await this.subcategoryRepository.remove(subcategory);
      return subcategory;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        error.message || 'Error deleting subcategory',
      );
    }
  }
}
