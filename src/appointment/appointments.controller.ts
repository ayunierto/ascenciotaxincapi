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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { CancelAppointmentDto } from './dto/cancel-appointment.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

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
  findAll(@Query() paginationDto: PaginationDto) {
    return this.appointmentsService.findAll(paginationDto);
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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentsService.remove(id);
  }

  @Patch(':id/cancel')
  @Auth()
  @HttpCode(HttpStatus.OK)
  async cancelAppointment(
    @Param('id') id: string,
    @Body() cancelDto: CancelAppointmentDto,
    @GetUser() user: User,
  ) {
    const userId = user.id; // Asumiendo que el guard añade el usuario a la request
    const cancelledAppointment =
      await this.appointmentsService.cancelAppointment(id, userId, cancelDto);

    return {
      message: 'Appointment cancelled successfully',
      appointment: cancelledAppointment,
    };
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
    @GetUser() user: User,
  ) {
    return this.appointmentsService.update(id, updateAppointmentDto, user);
  }
}
