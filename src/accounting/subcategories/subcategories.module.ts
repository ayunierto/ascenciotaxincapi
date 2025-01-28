import { Module } from '@nestjs/common';
import { SubcategoryService } from './subcategories.service';
import { SubcategoryController } from './subcategories.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategory } from './entities/subcategory.entity';

@Module({
  controllers: [SubcategoryController],
  providers: [SubcategoryService],
  imports: [TypeOrmModule.forFeature([Subcategory])],
  exports: [TypeOrmModule, SubcategoryService],
})
export class SubcategoryModule {}
