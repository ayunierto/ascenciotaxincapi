import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  async getAvailability(
    @Query('staffMemberId') staffMemberId: string,
    @Query('date') date: string, // Recibir la fecha completa
  ) {
    if (!staffMemberId || !date) {
      return { message: 'staffMemberId y date son requeridos.' };
    }
    const availableSlots = await this.availabilityService.getAvailability(
      staffMemberId,
      date,
    );
    return availableSlots;
  }
}
