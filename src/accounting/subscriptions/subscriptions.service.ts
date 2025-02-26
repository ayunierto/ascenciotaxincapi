import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { User } from 'src/auth/entities/user.entity';
import { Subscription } from './entities/subscription.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
  ) {}

  async create(createSubscriptionDto: CreateSubscriptionDto, user: User) {
    try {
      const subscription = this.subscriptionRepository.create({
        user,
        ...createSubscriptionDto,
      });
      await this.subscriptionRepository.save(subscription);
      return subscription;
    } catch (error) {
      console.error(error);
      throw new BadRequestException('Unable to create subscription');
    }
  }

  async checkUserSubscription({ id }: User): Promise<boolean> {
    try {
      const subscription = await this.subscriptionRepository.findOne({
        where: { id, status: 'active' },
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
