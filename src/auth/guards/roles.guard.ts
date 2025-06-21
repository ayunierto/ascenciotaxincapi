import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true; // If no roles are required, allow access
    if (requiredRoles.length === 0) return true; // If no roles are specified, allow access

    const { user } = context.switchToHttp().getRequest();
    if (!user) throw new Error('User not found in request context');

    for (const role of requiredRoles) {
      if (user.roles?.includes(role)) {
        return true;
      }
    }

    // return requiredRoles.some((role) => user.roles?.includes(role));

    throw new ForbiddenException(
      `User does not have the required roles: ${requiredRoles.join(', ')}`,
    );
  }
}
