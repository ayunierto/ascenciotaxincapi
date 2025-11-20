import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { StaffMembersService } from './staff-members.service';
import { CreateStaffMemberDto } from './dto/create-staff-member.dto';
import { UpdateStaffMemberDto } from './dto/update-staff-member.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { Role } from 'src/auth/enums/role.enum';

@Controller('staff-members')
export class StaffMembersController {
  constructor(private readonly staffService: StaffMembersService) {}

  @Post()
  @Auth(Role.Admin)
  create(@Body() createStaffMemberDto: CreateStaffMemberDto) {
    return this.staffService.create(createStaffMemberDto);
  }

  @Get()
  findAll() {
    return this.staffService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.staffService.findOne(id);
  }

  @Patch(':id')
  @Auth(Role.Admin)
  update(
    @Param('id') id: string,
    @Body() updateStaffMemberDto: UpdateStaffMemberDto,
  ) {
    return this.staffService.update(id, updateStaffMemberDto);
  }

  @Delete(':id')
  @Auth(Role.Admin)
  remove(@Param('id') id: string) {
    return this.staffService.remove(id);
  }
}
