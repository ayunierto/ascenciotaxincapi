import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('appointment')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(AuthGuard)
  create(@Body() createAppointmentDto: CreateAppointmentDto, @Request() req) {
    return this.appointmentService.create(createAppointmentDto, req.user);
  }

  @Get()
  findAll() {
    return this.appointmentService.findAll();
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  findCurrentUser(
    @Request() req,
    @Query('state') state: 'pending' | 'past' = 'pending',
  ) {
    return this.appointmentService.findCurrentUser(req.user, state);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.appointmentService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ) {
    return this.appointmentService.update(id, updateAppointmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(id);
  }
}
