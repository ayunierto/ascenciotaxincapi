import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { NotificationModule } from 'src/notification/notification.module';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => {
        return {
          global: true,
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: process.env.JWT_EXPIRY,
          },
        };
      },
    }),
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([User]),
    NotificationModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService, JwtModule, TypeOrmModule],
})
export class AuthModule {}
