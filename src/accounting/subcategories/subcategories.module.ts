import { Module } from '@nestjs/common';
import { SubcategoriesService } from './subcategories.service';
import { SubcategoriesController } from './subcategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategory } from './entities/subcategory.entity';
import { AuthModule } from 'src/auth/auth.module';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService],
  imports: [
    TypeOrmModule.forFeature([Subcategory]),
    AuthModule,
    CategoriesModule,
  ],
  exports: [SubcategoriesService],
})
export class SubcategoriesModule {}
