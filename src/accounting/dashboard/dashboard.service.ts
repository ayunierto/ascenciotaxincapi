import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Appointment } from '../../bookings/appointments/entities/appointment.entity';
import { StaffMember } from '../../bookings/staff-members/entities/staff-member.entity';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';
import { Service } from 'src/bookings/services/entities';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Appointment)
    private readonly appointmentRepository: Repository<Appointment>,
    @InjectRepository(Service)
    private readonly serviceRepository: Repository<Service>,
    @InjectRepository(StaffMember)
    private readonly staffRepository: Repository<StaffMember>,
  ) {}

  async getMetrics(): Promise<DashboardMetricsDto> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const next7Days = new Date(today);
    next7Days.setDate(next7Days.getDate() + 7);

    // Parallel queries for better performance
    const [
      totalUsers,
      totalAppointments,
      upcomingAppointments,
      todayAppointments,
      totalServices,
      activeStaff,
      completedAppointments,
    ] = await Promise.all([
      // Total active users
      this.userRepository.count({
        where: { isActive: true },
      }),

      // Total appointments (excluding deleted)
      this.appointmentRepository.count({
        where: { deletedAt: null },
      }),

      // Upcoming appointments (next 7 days, confirmed or pending)
      this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.start >= :now', { now })
        .andWhere('appointment.start < :next7Days', { next7Days })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: ['confirmed', 'pending'],
        })
        .andWhere('appointment.deletedAt IS NULL')
        .getCount(),

      // Today's appointments (confirmed or pending)
      this.appointmentRepository
        .createQueryBuilder('appointment')
        .where('appointment.start >= :today', { today })
        .andWhere('appointment.start < :tomorrow', { tomorrow })
        .andWhere('appointment.status IN (:...statuses)', {
          statuses: ['confirmed', 'pending'],
        })
        .andWhere('appointment.deletedAt IS NULL')
        .getCount(),

      // Total active services
      this.serviceRepository.count({
        where: {
          isActive: true,
          deletedAt: null,
        },
      }),

      // Total active staff
      this.staffRepository.count({
        where: {
          isActive: true,
          deletedAt: null,
        },
      }),

      // Completed appointments
      this.appointmentRepository.count({
        where: {
          status: 'completed',
          deletedAt: null,
        },
      }),
    ]);

    const metrics = new DashboardMetricsDto();
    metrics.totalUsers = totalUsers;
    metrics.totalAppointments = totalAppointments;
    metrics.upcomingAppointments = upcomingAppointments;
    metrics.todayAppointments = todayAppointments;
    metrics.totalServices = totalServices;
    metrics.activeStaff = activeStaff;
    metrics.completedAppointments = completedAppointments;

    // Monthly revenue calculation (optional - remove if no payment system)
    // You can implement this when you have a payments/invoices table
    // metrics.monthlyRevenue = await this.calculateMonthlyRevenue(startOfMonth, endOfMonth);

    return metrics;
  }

  async getTodayAppointments(): Promise<{
    appointments: Appointment[];
    total: number;
  }> {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const appointments = await this.appointmentRepository
      .createQueryBuilder('appointment')
      .leftJoinAndSelect('appointment.user', 'user')
      .leftJoinAndSelect('appointment.service', 'service')
      .leftJoinAndSelect('appointment.staff', 'staff')
      .where('appointment.start >= :today', { today })
      .andWhere('appointment.start < :tomorrow', { tomorrow })
      .andWhere('appointment.deletedAt IS NULL')
      .orderBy('appointment.start', 'ASC')
      .getMany();

    return {
      appointments,
      total: appointments.length,
    };
  }

  // Uncomment and implement when you have a payment/revenue system
  // private async calculateMonthlyRevenue(startOfMonth: Date, endOfMonth: Date): Promise<number> {
  //   const result = await this.appointmentRepository
  //     .createQueryBuilder('appointment')
  //     .leftJoin('appointment.service', 'service')
  //     .select('SUM(service.price)', 'total')
  //     .where('appointment.status = :status', { status: 'completed' })
  //     .andWhere('appointment.createdAt BETWEEN :start AND :end', {
  //       start: startOfMonth,
  //       end: endOfMonth,
  //     })
  //     .andWhere('appointment.deletedAt IS NULL')
  //     .getRawOne();
  //
  //   return parseFloat(result.total) || 0;
  // }
}
