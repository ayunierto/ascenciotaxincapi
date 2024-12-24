import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from '../auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Service } from 'src/services/entities';
import { In, Repository } from 'typeorm';
import { Staff } from 'src/staff/entities/staff.entity';
import { Appointment } from './entities/appointment.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
  ) {}

  async create(createAppointmentDto: CreateAppointmentDto, user: User) {
    try {
      const {
        staff: staffId,
        service: serviceId,
        startDateAndTime,
        endDateAndTime,
        ...rest
      } = createAppointmentDto;

      // Get Staff Member
      const staff = await this.staffRepository.findOneBy({
        id: staffId,
      });

      //  Get Service
      const service = await this.serviceRepository.findOneBy({
        id: serviceId,
      });

      const apptoinment = this.appointmentRepository.create({
        user,
        staff,
        service,
        startDateAndTime: new Date(startDateAndTime),
        endDateAndTime: new Date(endDateAndTime),
        ...rest,
      });
      await this.appointmentRepository.save(apptoinment);
      return apptoinment;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll() {
    return `This action returns all appointment`;
  }

  async findOne(id: string) {
    return `This action returns a #${id} appointment`;
  }

  async update(id: string, updateAppointmentDto: UpdateAppointmentDto) {
    return `This action updates a #${id} appointment`;
  }

  async remove(id: string) {
    return `This action removes a #${id} appointment`;
  }

  async removeAll() {
    const query = this.appointmentRepository.createQueryBuilder('appointment');

    try {
      return await query.delete().where({}).execute();
    } catch (error) {
      throw new HttpException(
        {
          code: HttpStatus.BAD_REQUEST,
          message: 'Can not delete appointment',
          error: 'Can not delete appointment',
          cause: 'Unknown',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
