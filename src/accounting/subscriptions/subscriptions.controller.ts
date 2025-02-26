import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { User } from 'src/auth/entities/user.entity';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Auth()
  create(
    @Body() createSubscriptionDto: CreateSubscriptionDto,
    @GetUser() user: User,
  ) {
    return this.subscriptionsService.create(createSubscriptionDto, user);
  }

  @Get('check')
  @Auth()
  async checkSubscription(@GetUser() user: User) {
    const hasSubscription =
      await this.subscriptionsService.checkUserSubscription(user);
    return { hasSubscription };
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.subscriptionsService.findAll(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subscriptionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateSubscriptionDto: UpdateSubscriptionDto,
  ) {
    return this.subscriptionsService.update(+id, updateSubscriptionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscriptionsService.remove(+id);
  }
}
