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
import { Auth, GetUser } from 'src/auth/decorators';
import { ValidRoles } from 'src/auth/interfaces';
import { User } from 'src/auth/entities/user.entity';

@Controller('accounts-types')
export class AccountsTypesController {
  constructor(private readonly accountsTypesService: AccountsTypesService) {}

  @Post()
  @Auth(ValidRoles.admin)
  create(
    @Body() createAccountTypeDto: CreateAccountTypeDto,
    @GetUser() user: User,
  ) {
    return this.accountsTypesService.create(createAccountTypeDto, user);
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.accountsTypesService.findAll(user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id') id: string) {
    return this.accountsTypesService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
  ) {
    return this.accountsTypesService.update(id, updateAccountTypeDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.accountsTypesService.remove(id);
  }
}
