import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubcategoryService } from './subcategories.service';
import { CreateSubcategoryDto } from './dto/create-subcategory.dto';
import { UpdateSubcategoryDto } from './dto/update-subcategory.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createSubcategoryDto: CreateSubcategoryDto, @Request() req) {
    return this.subcategoryService.create(createSubcategoryDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll() {
    return this.subcategoryService.findAll();
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.subcategoryService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
    @Request() req,
  ) {
    return this.subcategoryService.update(id, updateSubcategoryDto, req.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string, @Request() req) {
    return this.subcategoryService.remove(id, req.user);
  }
}
