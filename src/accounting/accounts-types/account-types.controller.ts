import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AccountTypesService } from './account-types.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('account-types')
export class AccountTypesController {
  constructor(private readonly accountsTypesService: AccountTypesService) {}

  @Post()
  @Auth(Role.SuperUser, Role.Admin)
  create(@Body() createAccountTypeDto: CreateAccountTypeDto) {
    return this.accountsTypesService.create(createAccountTypeDto);
  }

  @Get()
  @Auth(Role.SuperUser, Role.Admin)
  findAll() {
    return this.accountsTypesService.findAll();
  }

  @Get(':id')
  @Auth(Role.SuperUser, Role.Admin)
  findOne(@Param('id') id: string) {
    return this.accountsTypesService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.SuperUser, Role.Admin)
  update(
    @Param('id') id: string,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
  ) {
    return this.accountsTypesService.update(id, updateAccountTypeDto);
  }

  @Delete(':id')
  @Auth(Role.SuperUser, Role.Admin)
  remove(@Param('id') id: string) {
    return this.accountsTypesService.remove(id);
  }
}
