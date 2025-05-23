import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Currency } from '../currencies/entities/currency.entity';
import { AccountType } from '../accounts-types/entities/account-type.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
    @InjectRepository(AccountType)
    private readonly accountTypeRepository: Repository<AccountType>,
  ) {}

  async create(createAccountDto: CreateAccountDto, user: User) {
    try {
      const { currencyId, accountTypeId, ...rest } = createAccountDto;
      const currency = await this.currencyRepository.findOne({
        where: { id: currencyId },
      });
      const accountType = await this.accountTypeRepository.findOne({
        where: { id: accountTypeId },
      });
      if (!currency || !accountType) {
        throw new BadRequestException('Currency or account type not found');
      }

      const newAccount = this.accountRepository.create({
        ...rest,
        currency: currency,
        accountType: accountType,
        user: user,
      });
      this.accountRepository.save(newAccount);
      return newAccount;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const accounts = await this.accountRepository.find({
        where: { user: { id: user.id } },
        relations: ['currency', 'accountType'],
        take: limit,
        skip: offset,
      });
      return accounts;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findOne(id: string, user: User) {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: id, user: { id: user.id } },
        relations: ['currency', 'accountType'],
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }
      return account;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async update(id: string, updateAccountDto: UpdateAccountDto, user: User) {
    try {
      const { currencyId, accountTypeId, ...rest } = updateAccountDto;

      const currency = await this.currencyRepository.findOne({
        where: { id: currencyId },
      });
      const accountType = await this.accountTypeRepository.findOne({
        where: { id: accountTypeId },
      });
      if (!currency || !accountType) {
        throw new BadRequestException('Currency or account type not found');
      }

      const account = await this.accountRepository.findOne({
        where: { id: id, user: user },
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }
      const updatedAccount = await this.accountRepository.preload({
        id,
        accountType: accountType,
        currency: currency,
        ...rest,
      });
      updatedAccount.updatedAt = new Date();
      await this.accountRepository.save(updatedAccount);
      return updatedAccount;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async remove(id: string, user: User) {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: id, user: user },
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }
      await this.accountRepository.remove(account);
      return account;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
