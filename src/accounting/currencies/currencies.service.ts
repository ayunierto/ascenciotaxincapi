import {
  BadRequestException,
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
  ) {}

  async create(createCurrencyDto: CreateCurrencyDto) {
    try {
      const newCurrency = this.currencyRepository.create(createCurrencyDto);
      await this.currencyRepository.save(newCurrency);
      return newCurrency;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async findAll() {
    try {
      const currencies = await this.currencyRepository.find();
      return currencies;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async findOne(id: number) {
    try {
      const currency = await this.currencyRepository.findOneBy({ id });
      if (!currency) {
        throw new NotFoundException('Currency not found');
      }
      return currency;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async update(id: number, updateCurrencyDto: UpdateCurrencyDto) {
    try {
      const currency = await this.currencyRepository.findOneBy({ id });
      if (!currency) {
        throw new NotFoundException('Currency not found');
      }
      const updatedCurrency = Object.assign(currency, updateCurrencyDto);
      updatedCurrency.updateAt = new Date();
      await this.currencyRepository.save(updatedCurrency);
      return updatedCurrency;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  async remove(id: number) {
    try {
      const currency = await this.currencyRepository.findOneBy({ id });
      if (!currency) {
        throw new NotFoundException('Currency not found');
      }
      await this.currencyRepository.remove(currency);
      return currency;
    } catch (error) {
      console.error(error);
      return error;
    }
  }
}
