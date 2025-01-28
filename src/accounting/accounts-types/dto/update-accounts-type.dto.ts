import { PartialType } from '@nestjs/mapped-types';
import { CreateAccountsTypeDto } from './create-accounts-type.dto';

export class UpdateAccountsTypeDto extends PartialType(CreateAccountsTypeDto) {}
