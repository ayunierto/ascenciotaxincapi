import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { SearchAvailabilityDto } from './dto/search-availability.dto';

@Controller('availability')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  async checkAvailability(
    @Body() searchAvailabilityDto: SearchAvailabilityDto,
  ) {
    return await this.availabilityService.searchAvailability(
      searchAvailabilityDto,
    );
  }
}
