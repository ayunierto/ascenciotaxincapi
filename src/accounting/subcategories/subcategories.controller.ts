import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubcategoryService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  @Auth()
  create(
    @Body() createSubcategoryDto: CreateSubcategoryDto,
    @GetUser() user: User,
  ) {
    return this.subcategoryService.create(createSubcategoryDto, user);
  }

  @Get()
  @Auth()
  findAll() {
    return this.subcategoryService.findAll();
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.subcategoryService.findOne(+id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
    @GetUser() user: User,
  ) {
    return this.subcategoryService.update(+id, updateSubcategoryDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.subcategoryService.remove(+id, user);
  }
}
