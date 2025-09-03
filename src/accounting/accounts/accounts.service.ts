import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Currency } from '../currencies/entities/currency.entity';
import { AccountType } from '../accounts-types/entities/account-type.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import {
  CreateAccountResponse,
  DeleteAccountResponse,
  GetAccountResponse,
  GetAccountsResponse,
  UpdateAccountResponse,
} from './interfaces/';

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

  async create(
    createAccountDto: CreateAccountDto,
  ): Promise<CreateAccountResponse> {
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
      });
      this.accountRepository.save(newAccount);
      return newAccount;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while created account.',
        'CREATE_ACCOUNT_FAILED',
      );
    }
  }

  async findAll(paginationDto: PaginationDto): Promise<GetAccountsResponse> {
    try {
      const { limit = 10, offset = 0 } = paginationDto;
      const accounts = await this.accountRepository.find({
        relations: ['currency', 'accountType'],
        take: limit,
        skip: offset,
      });
      return accounts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching accounts.',
        'FETCH_ACCOUNTS_FAILED',
      );
    }
  }

  async findOne(id: string): Promise<GetAccountResponse> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: id },
        relations: ['currency', 'accountType'],
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }
      return account;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the account.',
        'FETCH_ACCOUNT_FAILED',
      );
    }
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
  ): Promise<UpdateAccountResponse> {
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
        where: { id: id },
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
      await this.accountRepository.save(updatedAccount);
      return updatedAccount;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the account.',
        'UPDATE_ACCOUNT_FAILED',
      );
    }
  }

  async remove(id: string): Promise<DeleteAccountResponse> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id: id },
      });
      if (!account) {
        throw new BadRequestException('Account not found');
      }
      await this.accountRepository.remove(account);
      return account;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the account.',
        'DELETE_ACCOUNT_FAILED',
      );
    }
  }
}
