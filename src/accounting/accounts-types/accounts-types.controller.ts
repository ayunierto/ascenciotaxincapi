import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AccountsTypesService } from './accounts-types.service';
import { CreateAccountTypeDto } from './dto/create-account-type.dto';
import { UpdateAccountTypeDto } from './dto/update-account-type.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('accounts-types')
export class AccountsTypesController {
  constructor(private readonly accountsTypesService: AccountsTypesService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createAccountTypeDto: CreateAccountTypeDto, @Request() req) {
    return this.accountsTypesService.create(createAccountTypeDto, req.user);
  }

  @Get()
  @UseGuards(AuthGuard)
  findAll(@Request() req) {
    return this.accountsTypesService.findAll(req.user);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  findOne(@Param('id') id: string) {
    return this.accountsTypesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  update(
    @Param('id') id: string,
    @Body() updateAccountTypeDto: UpdateAccountTypeDto,
  ) {
    return this.accountsTypesService.update(id, updateAccountTypeDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  remove(@Param('id') id: string) {
    return this.accountsTypesService.remove(id);
  }
}
