import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  @Auth()
  create(
    @Body() createAppointmentDto: CreateAppointmentDto,
    @GetUser() user: User,
  ) {
    return this.appointmentsService.create(createAppointmentDto, user);
  }

  @Get()
  findAll() {
    return this.appointmentsService.findAll();
  }

  @Get('current-user')
  @Auth()
  findCurrentUser(
    @GetUser() user: User,
    @Query('state') state: 'pending' | 'past' = 'pending',
  ) {
    return this.appointmentsService.findCurrentUser(user, state);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Get('availability')
  async checkAvailability(
    @Query('staffId') staffId: string, // 84097f13-8d57-46a8-ac1d-1f713f3fd2ea
    @Query('date') date: string, // 2025-01-023
    // @Query('serviceId') serviceId: string, // 0f4e8b1c-8e2a-4b6d-9f0c-5c3e2e3f4a1b
  ) {
    if (!staffId || !date) {
      return { message: 'The staff and date fields are required.' };
    }
    return await this.appointmentsService.checkAvailability(
      staffId,
      date,
      // serviceId,
    );
  }
}
