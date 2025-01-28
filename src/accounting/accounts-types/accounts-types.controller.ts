import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AccountsTypesService } from './accounts-types.service';
import { CreateAccountsTypeDto } from './dto/create-accounts-type.dto';
import { UpdateAccountsTypeDto } from './dto/update-accounts-type.dto';

@Controller('accounts-types')
export class AccountsTypesController {
  constructor(private readonly accountsTypesService: AccountsTypesService) {}

  @Post()
  create(@Body() createAccountsTypeDto: CreateAccountsTypeDto) {
    return this.accountsTypesService.create(createAccountsTypeDto);
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
  update(@Param('id') id: string, @Body() updateAccountsTypeDto: UpdateAccountsTypeDto) {
    return this.accountsTypesService.update(+id, updateAccountsTypeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.accountsTypesService.remove(+id);
  }
}
