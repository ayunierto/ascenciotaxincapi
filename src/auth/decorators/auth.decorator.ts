import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../enums/role.enum';
import { AuthGuard } from '../guards/auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from './roles.decorator';

export function Auth(...roles: Role[]) {
  return applyDecorators(Roles(...roles), UseGuards(AuthGuard, RolesGuard));
}
