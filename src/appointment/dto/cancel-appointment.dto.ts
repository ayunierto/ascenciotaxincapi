import { IsOptional, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CancelAppointmentDto {
  @ApiPropertyOptional({
    description: 'Reason for cancellation',
    example: 'Schedule conflict',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancellationReason?: string;
}