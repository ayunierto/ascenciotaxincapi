import { Injectable } from '@nestjs/common';
import { CreateAccountsTypeDto } from './dto/create-accounts-type.dto';
import { UpdateAccountsTypeDto } from './dto/update-accounts-type.dto';

@Injectable()
export class AccountsTypesService {
  create(createAccountsTypeDto: CreateAccountsTypeDto) {
    return 'This action adds a new accountsType';
  }

  findAll() {
    return `This action returns all accountsTypes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} accountsType`;
  }

  update(id: number, updateAccountsTypeDto: UpdateAccountsTypeDto) {
    return `This action updates a #${id} accountsType`;
  }

  remove(id: number) {
    return `This action removes a #${id} accountsType`;
  }
}
