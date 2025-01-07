import { Controller, Get, Query } from '@nestjs/common';
import { AvailabilityService } from './availability.service';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Get()
  async getAvailability(
    @Query('staff') staff: string, // 84097f13-8d57-46a8-ac1d-1f713f3fd2ea
    @Query('date') date: string, // 2025-01-023
  ) {
    if (!staff || !date) {
      return { message: 'The staff and date fields are required.' };
    }
    const availableSlots = await this.availabilityService.getAvailability(
      staff,
      date,
    );
    return availableSlots;
  }
}
