import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@Controller('appointments')
export class AppointmentsController {
  // eslint-disable-next-line no-unused-vars
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post('availability')
  async checkAvailability(@Body() checkAvailabilityDto: CheckAvailabilityDto) {
    return await this.appointmentsService.checkAvailability(
      checkAvailabilityDto,
    );
  }

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
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
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
}
