import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountType } from './entities/account-type.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class AccountsTypesService {
  constructor(
    @InjectRepository(AccountType)
    private readonly accountTypeRepository: Repository<AccountType>,
  ) {}

  async create(createAccountTypeDto: CreateAccountTypeDto, user: User) {
    try {
      const newAccountType = this.accountTypeRepository.create({
        ...createAccountTypeDto,
        user: user,
      });
      await this.accountTypeRepository.save(newAccountType);
      return newAccountType;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findAll(user: User) {
    try {
      const accounts = await this.accountTypeRepository.find({
        where: { user: { id: user.id } },
      });
      return accounts;
    } catch (error) {
      console.error(error);
    }
  }

  async findOne(id: number) {
    try {
      const account = await this.accountTypeRepository.findOneBy({ id });
      if (!account) {
        throw new NotFoundException('Account type not found');
      }
      return account;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async update(id: number, updateAccountTypeDto: UpdateAccountTypeDto) {
    try {
      const types = await this.accountTypeRepository.findOneBy({ id });
      if (!types) {
        throw new NotFoundException('Account type not found');
      }
      const updatedAccountTypes = Object.assign(types, updateAccountTypeDto);
      updatedAccountTypes.updatedAt = new Date();
      await this.accountTypeRepository.save(updatedAccountTypes);
      return updatedAccountTypes;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async remove(id: number) {
    try {
      const type = await this.accountTypeRepository.findOneBy({ id });
      if (!type) {
        throw new NotFoundException('Account type not found');
      }
      await this.accountTypeRepository.remove(type);
      return type;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
