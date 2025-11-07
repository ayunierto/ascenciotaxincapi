export class DashboardMetricsDto {
  totalUsers!: number;
  totalAppointments!: number;
  upcomingAppointments!: number;
  todayAppointments!: number;
  totalServices!: number;
  activeStaff!: number;
  completedAppointments!: number;
  monthlyRevenue?: number;
}