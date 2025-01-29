import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountsTypesService } from './accounts-types.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';

@Controller('accounts-types')
export class AccountsTypesController {
  constructor(private readonly accountsTypesService: AccountsTypesService) {}

  @Post()
  create(@Body() createAccountTypeDto: CreateAccountTypeDto) {
    return this.accountsTypesService.create(createAccountTypeDto);
  }

  @Get()
  findAll() {
    return this.accountsTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.accountsTypesService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
  ) {
    return this.accountsTypesService.update(+id, updateAccountTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsTypesService.remove(+id);
  }
}
