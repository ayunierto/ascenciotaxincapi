import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { User } from 'src/auth/entities/user.entity';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from '../plans/entities/plan.entity';
import { DateTime } from 'luxon';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(Plan)
    private readonly plansRepository: Repository<Plan>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, user: User) {
    const { planId, durationInMonths } = createSubscriptionDto;

    try {
      const plan = await this.plansRepository.findOne({
        where: { id: planId },
      });
      if (!plan) {
        throw new NotFoundException('Plan not found');
      }

      const startDate = new Date();
      const startDateTime = DateTime.fromJSDate(startDate);
      const endDate = startDateTime
        .plus({ months: durationInMonths })
        .toJSDate();

      const subscription = this.subscriptionRepository.create({
        user,
        plan,
        startDate,
        endDate,
        status: 'active',
      });

      const subscriptionSaved =
        await this.subscriptionRepository.save(subscription);
      return subscriptionSaved;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Unable to create subscription');
    }
  }

  async checkUserSubscription(user: User): Promise<boolean> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { user: { id: user.id }, status: 'active' },
      });
      if (!subscription) {
        return false;
      }

      const currentDate = new Date();
      if (subscription.endDate < currentDate) {
        return false;
      }

      return true;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Unable to find subscription');
    }
  }

  findAll() {
    return `This action returns all subscriptions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} subscription`;
  }

  update(id: number, updateSubscriptionDto: UpdateSubscriptionDto) {
    return { id, updateSubscriptionDto };
  }

  remove(id: number) {
    return `This action removes a #${id} subscription`;
  }
}
