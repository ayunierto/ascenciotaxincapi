import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CurrencyService } from './currencies.service';
import { CreateCurrencyDto } from './dto/create-currency.dto';
import { UpdateCurrencyDto } from './dto/update-currency.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Post()
  @Auth()
  create(@Body() createCurrencyDto: CreateCurrencyDto) {
    return this.currencyService.create(createCurrencyDto);
  }

  @Get()
  findAll() {
    return this.currencyService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.currencyService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateCurrencyDto: UpdateCurrencyDto,
  ) {
    return this.currencyService.update(id, updateCurrencyDto);
  }

  @Auth()
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.currencyService.remove(id);
  }
}
