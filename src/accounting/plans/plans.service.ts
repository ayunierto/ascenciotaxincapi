import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlanDto } from './dto/create-plan.dto';
import { UpdatePlanDto } from './dto/update-plan.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Plan } from './entities/plan.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class PlansService {
  constructor(
    @InjectRepository(Plan)
    private readonly planRepository: Repository<Plan>,
  ) {}

  async create(createPlanDto: CreatePlanDto, user: User) {
    try {
      const plan = this.planRepository.create({ user, ...createPlanDto });
      await this.planRepository.save(plan);
      return plan;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Unable to create plans');
    }
  }

  async findAll() {
    return await this.planRepository.find({
      relations: {
        discounts: true,
        user: true,
      },
    });
  }

  async findOne(id: string) {
    const plan = await this.planRepository.findOneBy({ id });
    if (!plan) throw new NotFoundException();

    return plan;
  }

  async update(id: string, updatePlanDto: UpdatePlanDto, user: User) {
    const plan = await this.planRepository.preload({
      id,
      updatedAt: new Date(),
      user,
      ...updatePlanDto,
    });
    if (!plan) throw new NotFoundException();
    try {
      await this.planRepository.save(plan);
      return plan;
    } catch (error) {
      return error;
    }
  }

  async remove(id: string) {
    const plan = await this.findOne(id);
    if (!plan) throw new NotFoundException();
    await this.planRepository.remove(plan);
    return plan;
  }
}
