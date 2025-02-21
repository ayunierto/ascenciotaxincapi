import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscountsOnPlanDto } from './create-discounts-on-plan.dto';

export class UpdateDiscountsOnPlanDto extends PartialType(CreateDiscountsOnPlanDto) {}
