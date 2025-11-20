import { Controller, Get } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('metrics')
  async getMetrics(): Promise<DashboardMetricsDto> {
    return this.dashboardService.getMetrics();
  }

  @Get('today-appointments')
  async getTodayAppointments() {
    return this.dashboardService.getTodayAppointments();
  }
}
