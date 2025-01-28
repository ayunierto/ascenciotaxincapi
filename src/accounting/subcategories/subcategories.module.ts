import { Module } from '@nestjs/common';
import { SubcategoryService } from './subcategories.service';
import { SubcategoryController } from './subcategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
  imports: [
    TypeOrmModule.forFeature([Subcategory]),
    AuthModule,
    CategoriesModule,
  ],
  exports: [TypeOrmModule, SubcategoryService],
})
export class SubcategoryModule {}
