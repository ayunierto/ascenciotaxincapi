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
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/enums/role.enum';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('subcategory')
export class SubcategoryController {
  constructor(private readonly subcategoryService: SubcategoryService) {}

  @Post()
  @Auth(Role.Admin, Role.Staff)
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
    return this.subcategoryService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.Admin, Role.Staff)
  update(
    @Param('id') id: string,
    @Body() updateSubcategoryDto: UpdateSubcategoryDto,
    @GetUser() user: User,
  ) {
    return this.subcategoryService.update(id, updateSubcategoryDto, user);
  }

  @Delete(':id')
  @Auth(Role.Admin, Role.Staff)
  remove(@Param('id') id: string, @GetUser() user: User) {
    return this.subcategoryService.remove(id, user);
  }
}
