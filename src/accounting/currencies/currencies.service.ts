import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Repository } from 'typeorm';
import { Currency } from './entities/currency.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private readonly currencyRepository: Repository<Currency>,
  ) { }

  async create(
    createCurrencyDto: CreateCurrencyDto,
  ): Promise<Currency> {
    try {
      const newCurrency = this.currencyRepository.create({
        ...createCurrencyDto,
      });
      await this.currencyRepository.save(newCurrency);
      return newCurrency;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the currency.',
        'CREATE_CURRENCY_FAILED',
      );
    }
  }

  async findAll(): Promise<Currency[]> {
    try {
      const currencies = await this.currencyRepository.find();
      return currencies;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the currencies.',
        'GET_CURRENCIES_FAILED',
      );
    }
  }

  async findOne(id: string): Promise<Currency> {
    try {
      const currency = await this.currencyRepository.findOneBy({ id });
      if (!currency) {
        throw new NotFoundException('Currency not found');
      }
      return currency;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the currency.',
        'GET_CURRENCY_FAILED',
      );
    }
  }

  async update(
    id: string,
    updateCurrencyDto: UpdateCurrencyDto,
  ): Promise<Currency> {
    try {
      const currency = await this.currencyRepository.findOneBy({ id });
      if (!currency) throw new NotFoundException('Currency not found');

      const updatedCurrency = this.currencyRepository.merge(
        currency,
        updateCurrencyDto,
      );
      await this.currencyRepository.save(updatedCurrency);
      return updatedCurrency;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the currency.',
        'UPDATE_CURRENCY_FAILED',
      );
    }
  }

  async remove(id: string): Promise<Currency> {
    try {
      const currency = await this.currencyRepository.findOneBy({ id });
      if (!currency) {
        throw new NotFoundException('Currency not found');
      }
      await this.currencyRepository.remove(currency);
      return currency;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the currency.',
        'DELETE_CURRENCY_FAILED',
      );
    }
  }
}
