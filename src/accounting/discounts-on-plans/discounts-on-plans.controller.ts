import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DiscountsOnPlansService } from './discounts-on-plans.service';
import { CreateDiscountsOnPlanDto } from './dto/create-discounts-on-plan.dto';
import { UpdateDiscountsOnPlanDto } from './dto/update-discounts-on-plan.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('discounts-on-plans')
export class DiscountsOnPlansController {
  constructor(
    private readonly discountsOnPlansService: DiscountsOnPlansService,
  ) {}

  @Post()
  @Auth()
  create(
    @Body() createDiscountsOnPlanDto: CreateDiscountsOnPlanDto,
    @GetUser() user: User,
  ) {
    return this.discountsOnPlansService.create(createDiscountsOnPlanDto, user);
  }

  @Get()
  findAll() {
    return this.discountsOnPlansService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.discountsOnPlansService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDiscountsOnPlanDto: UpdateDiscountsOnPlanDto,
  ) {
    return this.discountsOnPlansService.update(id, updateDiscountsOnPlanDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.discountsOnPlansService.remove(id);
  }
}
