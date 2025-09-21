import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountType } from './entities/account-type.entity';
import { Repository } from 'typeorm';
import {
  CreateAccountTypeResponse,
  GetAccountTypeResponse,
  GetAccountTypesResponse,
  UpdateAccountTypeResponse,
} from './interfaces';

@Injectable()
export class AccountTypesService {
  constructor(
    @InjectRepository(AccountType)
    private readonly accountTypeRepository: Repository<AccountType>,
  ) { }

  async create(
    createAccountTypeDto: CreateAccountTypeDto,
  ): Promise<CreateAccountTypeResponse> {
    try {
      const newAccountType =
        this.accountTypeRepository.create(createAccountTypeDto);
      await this.accountTypeRepository.save(newAccountType);
      return newAccountType;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating account type. Please try again later.',
        'CREATE_ACCOUNT_TYPE_FAILED',
      );
    }
  }

  async findAll(): Promise<GetAccountTypesResponse> {
    try {
      const accounts = await this.accountTypeRepository.find();
      return accounts;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while finding account types. Please try again later.',
        'GET_ACCOUNT_TYPES_FAILED',
      );
    }
  }

  async findOne(id: string): Promise<GetAccountTypeResponse> {
    const account = await this.accountTypeRepository.findOneBy({ id });
    if (!account) {
      throw new NotFoundException('Account type not found');
    }
    return account;
  }

  async update(id: string, updateAccountTypeDto: UpdateAccountTypeDto) {
    try {
      const accountType = await this.findOne(id);
      if (!accountType) {
        throw new NotFoundException('Account type not found');
      }
      const updatedAccountType = this.accountTypeRepository.merge(
        accountType,
        updateAccountTypeDto,
      );
      await this.accountTypeRepository.save(updatedAccountType);
      return updatedAccountType;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating account type. Please try again later.',
        'UPDATE_ACCOUNT_TYPE_FAILED',
      );
    }
  }

  async remove(id: string): Promise<UpdateAccountTypeResponse> {
    try {
      const type = await this.accountTypeRepository.findOneBy({ id });
      if (!type) {
        throw new NotFoundException('Account type not found');
      }
      await this.accountTypeRepository.remove(type);
      return type;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting account type. Please try again later.',
        'DELETE_ACCOUNT_TYPE_FAILED',
      );
    }
  }
}
