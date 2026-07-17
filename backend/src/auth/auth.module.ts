import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AdminAuthController } from './admin-auth.controller';
import { AdminGuard } from './admin.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: false,
      secret: process.env.JWT_SECRET || 'dev-insecure-secret-change-me',
      signOptions: {
        // env values are plain strings ('1d', '3600s'); jsonwebtoken's typed
        // `expiresIn` is a template-literal union, so cast the runtime value.
        expiresIn: (process.env.JWT_EXPIRES_IN ||
          process.env.JWT_EXP ||
          '1d') as `${number}${'d' | 'h' | 'm' | 's'}`,
      },
    }),
  ],
  controllers: [AdminAuthController],
  providers: [AuthService, AdminGuard, JwtAuthGuard],
  exports: [AuthService, AdminGuard, JwtAuthGuard, JwtModule],
})
export class AuthModule {}
