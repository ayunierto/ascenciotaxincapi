import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDiscountsOnPlanDto } from './dto/create-discounts-on-plan.dto';
import { UpdateDiscountsOnPlanDto } from './dto/update-discounts-on-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DiscountsOnPlan } from './entities/discounts-on-plan.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Plan } from '../plans/entities/plan.entity';

@Injectable()
export class DiscountsOnPlansService {
  constructor(
    @InjectRepository(DiscountsOnPlan)
    private readonly discountsOnPlanRepository: Repository<DiscountsOnPlan>,
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(createDiscountsOnPlanDto: CreateDiscountsOnPlanDto, user: User) {
    const plan = await this.planRepository.findOneBy({
      id: createDiscountsOnPlanDto.planId,
    });
    if (!plan) throw new NotFoundException('Plan not found');

    try {
      const discount = this.discountsOnPlanRepository.create({
        user,
        plan,
        ...createDiscountsOnPlanDto,
      });
      await this.discountsOnPlanRepository.save(discount);
      return discount;
    } catch (error) {
      return error;
    }
  }

  async findAll() {
    return await this.discountsOnPlanRepository.find();
  }

  async findOne(id: string) {
    const discount = await this.discountsOnPlanRepository.findOneBy({ id });
    if (!discount) throw new NotFoundException();

    return discount;
  }

  async update(id: string, updateDiscountsOnPlanDto: UpdateDiscountsOnPlanDto) {
    const discount = await this.discountsOnPlanRepository.preload({
      id,
      updatedAt: new Date(),
      ...updateDiscountsOnPlanDto,
    });
    if (!discount) throw new NotFoundException();
    try {
      await this.discountsOnPlanRepository.save(discount);
      return discount;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    const discount = await this.findOne(id);
    if (!discount) throw new NotFoundException();
    await this.discountsOnPlanRepository.remove(discount);
    return discount;
  }
}
